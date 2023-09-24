import { useState } from 'react'
import { Row, Col } from 'antd'
import FileDirectory from './components/fileDirectory'
import ContentEditor from './components/contentEditor'
import defaultFiles from './utils/defaultFiles'
import { flattenArr, objToArr } from './utils/helper'


const fs = window.require('fs')
const Store = window.require('electron-store')
const fileStore = new Store({name: 'Files Data'})

const saveFilesToStore = (files) => {
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const { id, path, title, createdAt } = file
    result[id] = {
      id,
      path,
      title,
      createdAt
    }
    return result
  }, {})
  fileStore.set('files', filesStoreObj)
}

function App() {
  console.log(fileStore.get('files'), 'fileStore.get(files)')
  const [files, setFiles] = useState(fileStore.get('files') || {})
  const [activeFileId, setActiveFileId] = useState('')
  const [openedFileIds, setOpenedFileIds] = useState([])
  const [unsavedFileIds, setUnsavedFileIds] = useState([])

  const tabClose = (id) => {
    const tabsWithout = openedFileIds.filter(fileId => fileId !== id)
    setOpenedFileIds(tabsWithout)
    if (id === activeFileId) {
      setActiveFileId(tabsWithout[0] || '')
    }
  }

  const fileDirectoryProps = {
    files,
    activeFileId,
    openedFileIds,
    unsavedFileIds,
    setFiles,
    setActiveFileId,
    setOpenedFileIds,
    setUnsavedFileIds,
    tabClose,
    saveFilesToStore,
  }
  return (
    <div className="App">
      <Row>
        <Col span={6}>
          <FileDirectory {...fileDirectoryProps} />
        </Col>
        <Col span={18}>
          <ContentEditor {...fileDirectoryProps} />
        </Col>
      </Row>
    </div>
  );
}

export default App;
