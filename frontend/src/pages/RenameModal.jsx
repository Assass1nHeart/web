import React, { memo, useState } from 'react';
import { Modal } from 'antd';
import update from 'immutability-helper';

const RenameModal = memo(({ columnId, data, changeData, visible, setSelectedColumn, deleteColumn }) => {
  const [copyData, setData] = useState(data);
  let isDropped = false;

  const handleClose = () => {
    deleteColumn(isDropped);
  };

  const handleSave = () => {
    if (isDropped) {
      const updatedData = update(copyData, { $splice: [[columnId, 1]] });
      changeData(updatedData);
    } else {
      changeData(copyData);
    }
    handleClose();
  };

  const handleNameChange = (e) => {
    if (e.target.value === '') {
      return;
    }
    const updatedData = update(copyData, {
      [columnId]: {
        name: { $set: e.target.value },
      },
    });
    setData(updatedData);
  };

  const handleDropChange = (e) => {
    isDropped = e.target.value === 'true';
  };

  return (
    <Modal
      title="IssueItem"
      visible={visible}
      onOk={() => {
        handleSave();
        alert('保存成功');
      }}
      onCancel={handleClose}
      className="MainBudy"
    >
      <div>
        <div className="container">
          <span className="text">原始项目名称: {data[columnId].name}</span>
        </div>

        <div className="container">
          <span className="text">新项目名称:</span>
          <input
            placeholder="输入新的列名称"
            onBlur={handleNameChange}
            className="input"
            type="text"
            name="text"
          />
        </div>

        <div className="container">
          <span className="text">
            删除项目:
            <select name="isDropped" id="Dropped" defaultValue="false" onChange={handleDropChange}>
              <option value="false">否</option>
              <option value="true">是</option>
            </select>
          </span>
        </div>
      </div>
    </Modal>
  );
});

export default RenameModal;
