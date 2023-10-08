import React, { useState, useRef, useEffect } from 'react'
import { List, Button, Row, Col, Input } from 'antd'
import { FileMarkdownOutlined, FormOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons'
import useKeyPress from '../../hooks/useKeyPress'
import useContextMenu from '../../hooks/useContextMenu'
import { flattenArr, objToArr, getParentNode } from '../../utils/helper'

// const remote = window.require('@electron/remote')
// const {Menu, MenuItem} = remote

type FilePorps = {
  id: string,
  title: string,
  body: string,
  createdAt?: number,
  isNew?: boolean
}

type FileListProps = {
  files: {[key: string]: FilePorps},
  onFileClick: (id: string) => void,
  onSaveEdit: (id: string, value: string, isNew: boolean) => void,
  onFileDelete: (id: string) => void
}
const FileList: React.FC<FileListProps> = ({files, onFileClick, onSaveEdit, onFileDelete}) => {
  // console.log(files, objToArr(files), 'objToArr(files)')
  const node = useRef(null)
  const [editStatus, setEditStatus] = useState('')
  const [value, setValue] = useState('')
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  const clickedItem = useContextMenu([
    {
      label: '打开',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'ant-list-item')
        if (parentElement) {
          onFileClick(parentElement.dataset.id)
        }
      }
    },
    {
      label: '删除',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'ant-list-item')
        if (parentElement) {
          onFileDelete(parentElement.dataset.id)
        }
      }
    },
    {
      label: '重命名',
      click: () => {
        const parentElement = getParentNode(clickedItem.current, 'ant-list-item')
        if (parentElement) {
          setEditStatus(parentElement.dataset.id)
          setValue(parentElement.dataset.title)
        }
      }
    }
  ], '.fileList', [files])

  const closeSearch = (editItem) => {
    setEditStatus('')
    setValue('')
    if (editItem.isNew) {
      onFileDelete(editItem.id)
    }
  }

  useEffect(() => {
    const editItem = files[editStatus]
    if (enterPressed && editStatus && value) {
      onSaveEdit(editStatus, value, editItem.isNew)
      setEditStatus('')
      setValue('')
    } else if (escPressed && editStatus) {
      closeSearch(editItem)
    }
  });

  useEffect(() => {
    const newFile = objToArr(files).find(file => file.isNew)
    if (newFile) {
      setEditStatus(newFile.id)
      setValue(newFile.title)
    }
  }, [files])

  useEffect(() => {
    if (editStatus) {
      node.current?.focus()
    }
  }, [editStatus])

  return (
    <List
      className='fileList'
      size="large"
      // header={<div>Header</div>}
      // footer={<div>Footer</div>}
      bordered
      dataSource={objToArr(files)}
      renderItem={(item) => <List.Item style={{padding: 12}} data-id={item.id} data-title={item.title}>
        {(item.id !== editStatus && !item.isNew) && <>
          <span style={{cursor: 'pointer'}} onClick={() => {onFileClick(item.id)}}><FileMarkdownOutlined style={{padding: '0 5px'}} />{item?.title}</span>
          {/* <div>
            <Button type="link" shape="circle" icon={<FormOutlined style={{color: '#333'}} />} onClick={() => {
              setEditStatus(item.id)
              setValue(item.title)
            }} />
            <Button type="link" shape="circle" icon={<DeleteOutlined style={{color: '#333'}} />} onClick={() => {onFileDelete(item.id)}} />
          </div> */}
        </>}
        {
          (item.id === editStatus || item.isNew) && <Row style={{width: '100%'}} align='middle' justify='space-between'>
            <Col span={22}>
              <Input style={{width: '95%'}} ref={node} placeholder="请输入文件名" value={value} onChange={(e) => setValue(e.target.value)} />
            </Col>
            <Col span={2}><CloseOutlined onClick={() => {closeSearch(item)}} /></Col>
          </Row>
        }
      </List.Item>}
    />
  )
}

export default FileList