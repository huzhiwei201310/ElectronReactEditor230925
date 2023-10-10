import React, { useState, useEffect, useRef } from 'react'
import { Input, Row, Col } from 'antd'
import { SearchOutlined, CloseOutlined } from '@ant-design/icons'
import useKeyPress from '../../hooks/useKeyPress'
import useIpcRenderer from '../../hooks/useIpcRenderer'

type FileSearchProps = {
  title: string,
  onFileSearch: (val: string) => void
}

const FileSearch: React.FC<FileSearchProps> = ({title, onFileSearch}) => {
  const [inputActive, setInputActive] = useState(false)
  const [value, setValue] = useState('')
  const enterPressed = useKeyPress(13)
  const escPressed = useKeyPress(27)
  const node = useRef(null)

  const closeSearch = () => {
    setInputActive(false)
    setValue('')
    onFileSearch('')
  }

  useEffect(() => {
    if (enterPressed && inputActive) {
      onFileSearch(value)
    } else if (escPressed && inputActive) {
      closeSearch()
    }
  });

  useEffect(() => {
    if (inputActive) {
      node.current?.focus()
    }
  }, [inputActive])

  useIpcRenderer({
    'search-file': () => {
      setInputActive(true)
    }
  })

  return (
    <div className='fileSearch'>
      {!inputActive ? 
        <Row align='middle' justify='space-between'>
          <Col flex={1}>{title}</Col>
          <Col><SearchOutlined onClick={() => setInputActive(true)} /></Col>
        </Row> :
        <Row align='middle' justify='space-between'>
          <Col span={22}><Input style={{width: '95%'}} ref={node} placeholder="文件名" value={value} onChange={(e) => setValue(e.target.value)} /></Col>
          <Col span={2}><CloseOutlined onClick={closeSearch} /></Col>
        </Row>
      }
    </div>
  )
}

export default FileSearch