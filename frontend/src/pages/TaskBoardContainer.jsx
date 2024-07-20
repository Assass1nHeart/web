import React, { useState, useEffect } from 'react';
import axios from 'axios';
import update from 'immutability-helper';
import {
  DragDropContext,
  Droppable,
  Draggable,
} from 'react-beautiful-dnd';
import TaskModel from './TaskModel';
import RenameModal from './RenameModal';
import LoadingIndicator from './LoadingIndicator';

const TaskBoardContainer = () => {
  const [status, setStatus] = useState('loading');
  
  useEffect(() => {
    setTimeout(() => {
      setStatus('home');
    }, 3000);
  }, []);
  
  if (status === 'loading') {
    return <LoadingIndicator />;
  } else {
    return <BoardHome />;
  }
};

const BoardHome = () => {
  const [data, setData] = useState([]);
  const [activeColumn, setActiveColumn] = useState(null);
  const [activeIssue, setActiveIssue] = useState(null);
  const [chosedColumn, setChosedColumn] = useState(null);
  const [userId, setUserId] = useState(0);
  const [username, setUsername] = useState('');

  useEffect(() => {
    axios.defaults.baseURL = 'http://127.0.0.1:8080';
    axios.get('/taskboard/get/')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });

    axios.get('/taskboard/getinfo/')
      .then(response => {
        setUserId(response.data.id);
        setUsername(response.data.username);
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
  }, []);

  const saveData = (updatedData) => {
    axios.post('/taskboard/save', { data: updatedData })
      .then(response => {
        if (response.data === 'success') {
          alert('保存成功');
        }
      })
      .catch(error => {
        alert('保存失败');
        console.error('Error saving data:', error);
      });
  };

  const handleIssueClick = (id, issueIndex) => {
    setActiveIssue({ columnId: id, issueId: issueIndex });
  };

  const handleDoubleClick = (columnIndex) => {
    addIssue(columnIndex);
  };

  const addIssue = (columnIndex) => {
    const newIssue = {
      id: data.length + 1,
      name: '新任务',
      comments: [],
      urls: [],
      content: '新任务',
    };

    const updatedData = update(data, {
      [columnIndex]: {
        issues: { $push: [newIssue] },
      },
    });

    setData(updatedData);
  };

  const handleDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    const fromColumnIndex = Number(source.droppableId);
    const fromIssueIndex = source.index;
    const toColumnIndex = Number(destination.droppableId);
    const toIssueIndex = destination.index;

    if (fromColumnIndex === toColumnIndex) {
      return;
    }

    const draggedIssue = data[fromColumnIndex].issues[fromIssueIndex];
    let updatedData = update(data, {
      [fromColumnIndex]: {
        issues: { $splice: [[fromIssueIndex, 1]] },
      },
    });

    if (toColumnIndex === 99) {
      setData(updatedData);
      setActiveColumn(null);
      return;
    }

    updatedData = update(updatedData, {
      [toColumnIndex]: {
        issues: { $splice: [[toIssueIndex, 0, draggedIssue]] },
      },
    });

    setData(updatedData);
    setActiveColumn(null);
  };

  const handleDropColumn = (isDropped) => {
    if (isDropped) {
      const updatedData = update(data, {
        $splice: [[chosedColumn, 1]],
      });
      setData(updatedData);
    }

    setChosedColumn(null);
  };

  const renderColumn = (column, columnIndex) => {
    const { id, issues } = column;

    const selectColumn = (index) => {
      switch (index % 3) {
        case 0:
          return 'todoColumn';
        case 1:
          return 'doingColumn';
        case 2:
          return 'doneColumn';
        default:
          return '';
      }
    };

    return (
      <div className={selectColumn(columnIndex)} key={id}>
        <div className="columnTitle" onDoubleClick={() => handleDoubleClick(columnIndex)}>
          {column.name}({issues.length})
        </div>
        <Droppable droppableId={`${columnIndex}`} mode="virtual">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              className={snapshot.isDraggingOver ? 'columnContentActive' : 'columnContent'}
              {...provided.droppableProps}
            >
              {issues.map((issue, index) => (
                <Draggable key={issue.id} draggableId={`${issue.id}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={snapshot.isDragging ? 'issueDragging' : 'issue'}
                      onClick={() => handleIssueClick(id, index)}
                    >
                      {issue.name}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  const handleAddColumn = () => {
    const newColumn = {
      id: data.length + 1,
      name: 'new column',
      issues: [],
    };

    const updatedData = update(data, { $push: [newColumn] });
    setData(updatedData);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="MainBody">
        <DustBin />
        <div className="header">
          Task Board Total Columns: {data.length}
          <div className="headerTitle">
            from &ensp;
            {username} &ensp; id: {userId}
            <button className="button" onClick={handleAddColumn}>
              Adding Column
            </button>
            <button className="button" onClick={() => saveData(data)}>
              Saving Data
            </button>
          </div>
        </div>
        <div className="container">
          {data.map((column, index) => (
            renderColumn(column, index)
          ))}
          {activeIssue && (
            <TaskModel
              columnId={activeIssue.columnId}
              issueId={activeIssue.issueId}
              data={data}
              onCancel={() => setActiveIssue(null)}
              onOk={() => setActiveIssue(null)}
              visible={activeIssue !== null}
              changeData={(newData) => {
                setData(newData);
                saveData(newData);
              }}
            />
          )}
          {chosedColumn !== null && (
            <RenameModal
              columnId={chosedColumn}
              data={data}
              changeData={(newData) => setData(newData)}
              visible={chosedColumn !== null}
              setChosedColumn={setChosedColumn}
              DropColumn={handleDropColumn}
            />
          )}
        </div>
      </div>
    </DragDropContext>
  );
};

export default TaskBoardContainer;
