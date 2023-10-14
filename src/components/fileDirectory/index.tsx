import React, { useState } from "react"
import {Row, Col, Button, message} from 'antd'
import { ImportOutlined, PlusOutlined } from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { cloneDeep } from 'lodash'
import FileSearch from './fileSearch'
import FileList from './fileList'
import { flattenArr, objToArr } from '../../utils/helper'
import fileHelper from '../../utils/fileHelper'
import useIpcRenderer from '../../hooks/useIpcRenderer'
import './index.less'

// 引入node.js 模块
const fs = window.require('fs')
const { join, basename, extname, dirname } = window.require('path')
const remote = window.require('@electron/remote')
const Store = window.require('electron-store')
const settingsStore = new Store({name: 'Settings'})

type fileProps = {
  id: string,
  title: string,
  body: string,
  createdAt: number,
  isNew?: boolean,
  path: string,
  isLoaded: boolean | undefined
}

type FileDirectoryProps = {
  files: {[key: string]: fileProps},
  activeFileId: string,
  openedFileIds: string[],
  unsavedFileIds: string[],
  setFiles: (value: {[key: string]: fileProps}) => void,
  setActiveFileId: (id: string) => void,
  tabClose: (id: string) => void,
  setOpenedFileIds: (id: string[]) => void,
  setUnsavedFileIds: (id: string[]) => void,
  saveFilesToStore: (value: {[key: string]: fileProps}) => void,
}

const FileDirectory: React.FC<FileDirectoryProps> = ({
  files,
  activeFileId,
  openedFileIds,
  unsavedFileIds,
  setFiles,
  setActiveFileId,
  setOpenedFileIds,
  setUnsavedFileIds,
  tabClose,
  saveFilesToStore
}) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [searchedFiles, setSearchedFiles] = useState([])
  const savedLocation = settingsStore.get('savedFileLocaltion') || remote.app.getPath('documents')

  const onFileClick = (id: string) => {
    setActiveFileId(id)
    const currentFile = files[id]
    if (!currentFile.isLoaded) {
      try {
        fs.accessSync(currentFile.path)
        fileHelper.readFile(currentFile.path).then(value => {
          const newFile = {...currentFile, body: value, isLoaded: true}
          setFiles({...files, [id]: newFile})
        })
      } catch (error) {
        remote.dialog.showMessageBox({
          type: 'info',
          title: `系统中不存在此文件`,
          message: `系统中不存在此文件`,
        })
      }
    }
    if (!openedFileIds.includes(id)) {
      setOpenedFileIds([...openedFileIds, id])
    }
  }
  const onSaveEdit = (id: string, value: string, isNew) => {
    // path 区分新旧文件
    const newPath = isNew ? join(savedLocation, `${value}.md`) :
    join(dirname(files[id].path), `${value}.md`)
    const modifiedFile = {...files[id], title: value, isNew: false, path: newPath}
    const newFiles = {...files, [id]: modifiedFile}
    if (isNew) {
      const fileList = objToArr(files)
      const isTitleRepeat = fileList.some(file => file.title === value)
      if (isTitleRepeat) {
        messageApi.open({
          type: 'warning',
          content: '文件名重复了',
        });
      } else {
        fileHelper.writeFile(newPath, files[id].body).then(() => {
          setFiles(newFiles)
          saveFilesToStore(newFiles)
        })
      }
    } else {
      try {
        const oldPath = files[id].path
        fs.accessSync(oldPath)
        fileHelper.renameFile(oldPath, newPath)
        .then(() => {
          setFiles(newFiles)
          saveFilesToStore(newFiles)
        })
      } catch (error) {
        remote.dialog.showMessageBox({
          type: 'info',
          title: `系统中不存在此文件`,
          message: `系统中不存在此文件`,
        })
      }
    }
  }
  const onFileDelete = (id: string) => {
    if (files[id].isNew) {
      // delete files[id]
      // setFiles(files)
      const { [id]: value, ...afterDelete} = files
      setFiles(afterDelete)
    } else {
      try {
        fs.accessSync(files[id].path)
        fileHelper.deleteFile(files[id].path).then(() => {
          const { [id]: value, ...afterDelete} = files
          setFiles(afterDelete)
          saveFilesToStore(afterDelete)
          if (openedFileIds.includes(id)) {
            tabClose(id)
          }
        })
      } catch (error) {
        remote.dialog.showMessageBox({
          type: 'info',
          title: `系统中不存在此文件`,
          message: `系统中不存在此文件`,
        })
        const { [id]: value, ...afterDelete} = files
        setFiles(afterDelete)
        saveFilesToStore(afterDelete)
        if (openedFileIds.includes(id)) {
          tabClose(id)
        }
      }
    }
  }
  const fileSearch = (keyword) => {
    const newFiles = objToArr(files).filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }

  const createNewFile = () => {
    const newId = uuidv4()
    const newFile = {
      id: newId,
      title: '',
      body: '## 请输入 Markdown',
      createdAt: new Date().getTime(),
      isNew: true,
    }
    setFiles({...files, [newId]: newFile})
  }

  const fileListProps = {
    files: searchedFiles.length > 0 ? flattenArr(searchedFiles) : files,
    onFileClick,
    onSaveEdit,
    onFileDelete
  }

  const importFiles = async () => {
    const {canceled, filePaths} = await remote.dialog.showOpenDialog({
      title: '选择导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {name: 'Markdown Files', extensions: ['md']}
      ]
    })
    if (Array.isArray(filePaths)) {
      const filteredPaths = filePaths.filter(path => {
        const alreadyAdded = Object.values(files).some(file => {
          return file.path === path
        })
        return !alreadyAdded
      })

      const importFilesArr = filteredPaths.map(path => {
        return {
          id: uuidv4(),
          title: basename(path, extname(path)),
          path
        }
      })

      const newFiles = {...files, ...flattenArr(importFilesArr)}
      setFiles(newFiles)
      saveFilesToStore(newFiles)
      if (importFilesArr.length) {
        remote.dialog.showMessageBox({
          type: 'info',
          title: `成功导入了${importFilesArr.length}个文件`,
          message: `成功导入了${importFilesArr.length}个文件`,
        })
      }
    }
  }

  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
  })

  return (
    <div className={'fileDirectory'}>
      {contextHolder}
      <FileSearch title='我的云文档' onFileSearch={fileSearch} />
      <FileList {...fileListProps} />
      <Row justify='space-around' className="bottomBtn">
        <Col span={12}>
          <Button onClick={createNewFile} type="primary" icon={<PlusOutlined />} block>新建</Button>
        </Col>
        <Col span={12}>
          <Button onClick={importFiles} type="primary" icon={<ImportOutlined />} block style={{background: 'green'}}>导入</Button>
        </Col>
      </Row>
    </div>
  )
}

export default FileDirectory