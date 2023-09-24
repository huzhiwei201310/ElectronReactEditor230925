import React from 'react'
import { Tabs } from 'antd'

type TabListProps = {
  files: any[],
  activeId: string,
  unsaveIds: string[],
  onTabClick: (id: string) => void,
  onCloseTab: (id: string) => void
}
const TabList: React.FC<TabListProps> = ({files, activeId, unsaveIds, onTabClick, onCloseTab}) => {

  console.log(files, 'files---')
  const fileList = files.map(item => {
    const isUnsave = unsaveIds.includes(item.key)
    return {
      ...item,
      closeIcon: <span className={isUnsave ? 'isUnsave' : ''}>X</span>
    }
  })

  return (
    <Tabs
      hideAdd
      type="editable-card"
      onChange={onTabClick}
      activeKey={activeId}
      onEdit={onCloseTab}
      items={fileList}
    />
  )
}

export default TabList