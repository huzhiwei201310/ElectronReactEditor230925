import React, { useEffect } from "react"
import { Modal, Form, Button, Input } from 'antd'
const remote = window.require('@electron/remote')
const Store = window.require('electron-store')
const settingsStore = new Store({name: 'Settings'})

const { Search } = Input

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19 },
  },
};

const SettingsModal = ({isModalOpen, setIsModalOpen}) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (isModalOpen) {
      const pathName = settingsStore.get('savedFileLocaltion')
      form.setFieldValue('pathName', pathName)
    }
  }, [isModalOpen])

  const handleOk = () => {
    form.validateFields().then((values) => {
      settingsStore.set('savedFileLocaltion', values.pathName)
      handleCancel()
    })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const config = {
    rules: [{require: true, message: '选择文件存储位置'}]
  }

  const onSearch = () => {
    remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
      message: '选择文件的存储路径'
    }).then((result) => {
      if (Array.isArray(result.filePaths) && result.filePaths?.length) {
        form.setFieldValue('pathName', result.filePaths[0])
      }
    })
  }

  return (
    <Modal width={800} title="设置" cancelText='取消' okText='保存' open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      <Form
        form={form}
        {...formItemLayout}
      >
        <Form.Item name="pathName" label="选择文件存储位置" {...config}>
          <Search
            readOnly
            placeholder="当前存储地址"
            enterButton="选择新的位置"
            size="large"
            onSearch={onSearch}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SettingsModal