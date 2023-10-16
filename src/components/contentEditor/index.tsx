import React, { useState, useCallback, useMemo } from "react"
import { Alert, Button, Skeleton } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import SimpleMDE from 'react-simplemde-editor'
import * as marked from 'marked'
import TabList from './tabList'
import fileHelper from '../../utils/fileHelper'
import useIpcRenderer from '../../hooks/useIpcRenderer'
import 'easymde/dist/easymde.min.css'
import './index.less'

// 引入node.js 模块
const { join } = window.require('path')
const remote = window.require('@electron/remote')

type fileProps = {
  id: string,
  title: string,
  body: string,
  createdAt: number,
  isNew?: boolean,
  path: string
}

type ContentEditorProps = {
  files: {[key: string]: fileProps},
  activeFileId: string,
  openedFileIds: string[],
  unsavedFileIds: string[],
  setFiles: (value: {[key: string]: fileProps}) => void,
  setActiveFileId: (id: string) => void,
  setOpenedFileIds: (id: string[]) => void,
  setUnsavedFileIds: (id: string[]) => void,
  tabClose: (id: string) => void,
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  files,
  activeFileId,
  openedFileIds,
  unsavedFileIds,
  setFiles,
  setActiveFileId,
  setOpenedFileIds,
  setUnsavedFileIds,
  tabClose
}) => {
  const savedLocation = remote.app.getPath('documents')
  const openedFiles = openedFileIds.map(openId => {
    return files[openId]
  })
  const activeFile = files[activeFileId]
  const tabListProps = {
    files: openedFiles?.map(item => ({key: item.id, label: item.title})),
    activeId: activeFileId,
    unsaveIds: unsavedFileIds,
    onTabClick: (id) => {
      setActiveFileId(id)
    },
    onCloseTab: tabClose
  }

  const fileChange = (value: string) => {
    setFiles({...files, [activeFileId]: {...files[activeFileId], body: value}})
    if (!unsavedFileIds.includes(activeFileId)) {
      setUnsavedFileIds([...unsavedFileIds, activeFileId])
    }
  }

  const options = useMemo(() => {
    return {
      minHeight: '600px',
      maxHeight: '600px',
      previewRender: (plainText, preview) => {
        setTimeout(() => {
          preview.innerHTML = marked.parse(plainText)
        },300)
        return 'Loading...'
      }
    }
  }, [])

  const saveCurrentFile = () => {
    fileHelper.writeFile(activeFile.path, activeFile.body).then(() => {
      setUnsavedFileIds(unsavedFileIds.filter(id => id !== activeFileId))
    })
  }

  useIpcRenderer({
    'save-edit-file': saveCurrentFile
  })

  return (
    <div>
      {
        !activeFile && <div style={{padding: 20}}>
          <Alert
            message="选择或者创建新地 Markdown 文档"
            type="warning"
          />
          <Skeleton active />
        </div>
      }
      {
        activeFile && <>
          <TabList {...tabListProps} />
          <SimpleMDE
            value={activeFile?.body}
            onChange={fileChange}
            options={options}
          />
        </>
      }
    </div>
  )
}

export default ContentEditor