import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import update from 'immutability-helper';
import './TaskBoardContainer.css';
import TaskModel from './TaskModel';
import RenameModal from './RenameModal';
import axios from 'axios';
import LoadingIndicator from './LoadingIndicator';

const TaskBoardContainer = () => {
  const [status, setStatus] = useState('loading');
  const [data, setData] = useState([]);
  const [activeIssue, setActiveIssue] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [userId, setUserId] = useState(0);
  const [username, setUsername] = useState('');

  useEffect(() => {
    axios.defaults.baseURL = 'http://127.0.0.1:8080';
    axios.get('/taskboard/get/')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error);
      });
    axios.get('/taskboard/getinfo/')
      .then(response => {
        setUserId(response.data.id);
        setUsername(response.data.username);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setStatus('home'), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (status === 'loading') {
    return <LoadingIndicator />;
  }

  const saveData = () => {
    axios.post('/taskboard/save', { data })
      .then(response => {
        if (response.data === 'success') {
          alert('保存成功');
        }
      })
      .catch(error => {
        alert('保存失败');
      });
  };

  const addColumn = () => {
    const newColumn = {
      id: data.length,
      name: 'new column',
      issues: [
        { id: 'todo', name: 'to do', issues: [] },
        { id: 'doing', name: 'doing', issues: [] },
        { id: 'done', name: 'done', issues: [] },
      ],
    };
    setData(prevData => [...prevData, newColumn]);
  };

  const addIssue = (columnIndex, subColumnIndex) => {
    const newIssue = {
      id: Date.now(),
      name: '新任务',
      comments: [],
      urls: [],
      content: '新任务',
    };
    const updatedData = update(data, {
      [columnIndex]: { issues: { [subColumnIndex]: { issues: { $push: [newIssue] } } } },
    });
    setData(updatedData);
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const fromColIndex = parseInt(source.droppableId.split('-')[0], 10);
    const fromSubColIndex = parseInt(source.droppableId.split('-')[1], 10);
    const fromIssueIndex = source.index;
    const toColIndex = parseInt(destination.droppableId.split('-')[0], 10);
    const toSubColIndex = parseInt(destination.droppableId.split('-')[1], 10);

    const movedIssue = data[fromColIndex].issues[fromSubColIndex].issues[fromIssueIndex];
    let tempData = update(data, {
      [fromColIndex]: { issues: { [fromSubColIndex]: { issues: { $splice: [[fromIssueIndex, 1]] } } } },
    });

    if (destination.droppableId === 'dustbin') {
      // 删除任务
      console.log('任务被拖入垃圾箱:', movedIssue);
      setData(tempData);
      return;
    }

    const toIssueIndex = destination.index;
    tempData = update(tempData, {
      [toColIndex]: { issues: { [toSubColIndex]: { issues: { $splice: [[toIssueIndex, 0, movedIssue]] } } } },
    });

    setData(tempData);
  };

  const Column = ({ columnIndex, column }) => (
    <div className="mainColumn">
      <div className="columnTitle" onDoubleClick={() => setSelectedColumn(columnIndex)}>
        {column.name}({column.issues.reduce((acc, subCol) => acc + subCol.issues.length, 0)})
      </div>
      <div className="subColumns">
        {column.issues.map((subColumn, subIndex) => (
          <Droppable droppableId={`${columnIndex}-${subIndex}`} key={`${columnIndex}-${subIndex}`}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                className={snapshot.isDraggingOver ? 'subColumnContentActive' : 'subColumnContent'}
                {...provided.droppableProps}
                onDoubleClick={() => addIssue(columnIndex, subIndex)}
              >
                <div className="subColumnTitle">{subColumn.name}</div>
                {subColumn.issues.map((issue, index) => (
                  <Draggable key={issue.id} draggableId={`${issue.id}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? 'issueDragging' : 'issue'}
                        onClick={() => setActiveIssue({ columnId: columnIndex, subColumnId: subIndex, issueId: index })}
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
        ))}
      </div>
    </div>
  );

  const deleteColumn = (confirmDelete) => {
    if (confirmDelete) {
      setData(prevData => prevData.filter((_, index) => index !== selectedColumn));
    }
    setSelectedColumn(null);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="MainBody">
        <div className="header">
          Task Board Total Columns: {data.length}
          <div className="headerTitle">
            from &ensp; {username} &ensp; id: {userId}
            <button className="button" onClick={addColumn}>
              Adding Column
            </button>
            <button className="button" onClick={saveData}>
              Saving Data
            </button>
          </div>
        </div>
        <div className="container">
          {data.map((column, index) => (
            <Column key={column.id} columnIndex={index} column={column} />
          ))}
          {activeIssue && (
            <TaskModel
              columnId={activeIssue.columnId}
              subColumnId={activeIssue.subColumnId}
              issueId={activeIssue.issueId}
              data={data}
              onCancel={() => setActiveIssue(null)}
              onOk={() => setActiveIssue(null)}
              visible={!!activeIssue}
              changeData={newData => {
                setData(newData);
                saveData();
              }}
            />
          )}
          {selectedColumn !== null && (
            <RenameModal
              columnId={selectedColumn}
              data={data}
              changeData={setData}
              visible={selectedColumn !== null}
              setSelectedColumn={setSelectedColumn}
              deleteColumn={deleteColumn}
            />
          )}
        </div>
        <div className="dustbinContainer">
          <div className="columnTitle">垃圾箱</div>
          <Droppable droppableId="dustbin">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                className={snapshot.isDraggingOver ? 'dustbinContentActive' : 'dustbinContent'}
                {...provided.droppableProps}
              >
                {provided.placeholder}
                {!snapshot.isDraggingOver ? '请放入废弃任务' : '确认回收任务?'}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  );
};

export default TaskBoardContainer;
