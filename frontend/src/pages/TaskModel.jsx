import React, { useState } from 'react';
import { Modal, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import update from 'immutability-helper';

const TaskModel = ({ columnId, subColumnId, issueId, data, onOk, onCancel, visible, changeData }) => {
  const [taskData, setTaskData] = useState(data);

  const handleSave = () => {
    changeData(taskData);
    onOk();
  };

  const handleUploadChange = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 上传成功`);
      setTaskData((prevData) => {
        const updatedData = update(prevData, {
          [columnId]: {
            subColumns: {
              [prevData[columnId].subColumns.findIndex(sub => sub.id === subColumnId)]: {
                issues: {
                  [issueId]: {
                    urls: { $push: [`http://127.0.0.1:8080/upload/${info.file.name}`] },
                  }
                }
              }
            }
          }
        });
        return updatedData;
      });
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败.`);
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    if (newName !== '') {
      setTaskData((prevData) => {
        const updatedData = update(prevData, {
          [columnId]: {
            subColumns: {
              [prevData[columnId].subColumns.findIndex(sub => sub.id === subColumnId)]: {
                issues: {
                  [issueId]: {
                    name: { $set: newName },
                  }
                }
              }
            }
          }
        });
        return updatedData;
      });
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    if (newContent !== '') {
      setTaskData((prevData) => {
        const updatedData = update(prevData, {
          [columnId]: {
            subColumns: {
              [prevData[columnId].subColumns.findIndex(sub => sub.id === subColumnId)]: {
                issues: {
                  [issueId]: {
                    content: { $set: newContent },
                  }
                }
              }
            }
          }
        });
        return updatedData;
      });
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const newComment = e.target[0].value;
    if (newComment !== '') {
      setTaskData((prevData) => {
        const updatedData = update(prevData, {
          [columnId]: {
            subColumns: {
              [prevData[columnId].subColumns.findIndex(sub => sub.id === subColumnId)]: {
                issues: {
                  [issueId]: {
                    comments: { $push: [newComment] },
                  }
                }
              }
            }
          }
        });
        e.target[0].value = '';
        return updatedData;
      });
    }
  };

  // Ensure correct access to issues
  const currentIssue = taskData[columnId]?.subColumns?.find(sub => sub.id === subColumnId)?.issues?.[issueId];

  return (
    <Modal
      title="任务详情"
      visible={visible}
      onOk={handleSave}
      onCancel={onCancel}
      className="task-modal"
    >
      {currentIssue ? (
        <div>
          <div>
            <span>项目名称: {taskData[columnId]?.name || '无名'}</span>
          </div>
          <div>
            <span>任务名称:</span>
            <input
              defaultValue={currentIssue.name}
              onBlur={handleNameChange}
              className="task-name-input"
            />
          </div>
          <div>
            <span>任务描述:</span>
            <textarea
              defaultValue={currentIssue.content}
              onBlur={handleContentChange}
              className="task-content-textarea"
            />
          </div>
          <div>
            <span>评论:</span>
            <ul>
              {currentIssue.comments?.map((comment, index) => (
                <li key={index}>第 {index + 1} 个: {comment}</li>
              ))}
            </ul>
            <form onSubmit={handleCommentSubmit}>
              <input type="text" className="comment-input" />
              <button type="submit">添加评论</button>
            </form>
          </div>
          <div>
            <span>附加文件:</span>
            <ul>
              {currentIssue.urls?.map((url, index) => (
                <li key={index}>
                  <a href={url} download={url}>第 {index + 1} 个: {url.split('/').pop()}</a>
                </li>
              ))}
            </ul>
            <Upload
              name="file"
              action="http://127.0.0.1:8080/taskboard/upload"
              onChange={handleUploadChange}
            >
              <Button icon={<UploadOutlined />} className="upload-button">添加附件</Button>
            </Upload>
          </div>
        </div>
      ) : (
        <div>加载中...</div>
      )}
    </Modal>
  );
};

export default TaskModel;
