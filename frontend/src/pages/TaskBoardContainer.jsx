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
        setStatus('home');
      })
      .catch(error => {
        console.log(error);
        setStatus('home');
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
      name: '新项目',
      subColumns: [
        { id: 1, name: 'to do', issues: [] },
        { id: 2, name: 'doing', issues: [] },
        { id: 3, name: 'done', issues: [] }
      ]
    };
    setData(prevData => [...prevData, newColumn]);
  };

  const addIssue = (columnIndex, subColumnId) => {
    const newIssue = {
      id: Date.now(), // Unique ID for new issue
      name: '新任务',
      comments: [],
      urls: [],
      content: '新任务',
    };
    const updatedData = update(data, {
      [columnIndex]: {
        subColumns: {
          [data[columnIndex].subColumns.findIndex(sub => sub.id === subColumnId)]: {
            issues: { $push: [newIssue] }
          }
        }
      }
    });
    setData(updatedData);
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const [fromColIndex, fromSubColId] = source.droppableId.split('-').map(Number);
    const fromIssueIndex = source.index;
    const [toColIndex, toSubColId] = destination.droppableId.split('-').map(Number);
    const toIssueIndex = destination.index;

    if (isNaN(fromColIndex) || isNaN(toColIndex)) return;

    const movedIssue = data[fromColIndex].subColumns.find(sub => sub.id === fromSubColId).issues[fromIssueIndex];
    let tempData = update(data, {
      [fromColIndex]: {
        subColumns: {
          [data[fromColIndex].subColumns.findIndex(sub => sub.id === fromSubColId)]: {
            issues: { $splice: [[fromIssueIndex, 1]] }
          }
        }
      }
    });

    if (toColIndex === 99) {
      // 删除任务
      console.log('任务被拖入垃圾箱:', movedIssue);
      setData(tempData);
      return;
    }

    tempData = update(tempData, {
      [toColIndex]: {
        subColumns: {
          [tempData[toColIndex].subColumns.findIndex(sub => sub.id === toSubColId)]: {
            issues: { $splice: [[toIssueIndex, 0, movedIssue]] }
          }
        }
      }
    });

    setData(tempData);
  };

  const Column = ({ columnIndex, column }) => {
    return (
      <div className="mainColumn" onDoubleClick={() => setSelectedColumn(columnIndex)}>
        <div className="columnTitle">{column.name}</div>
        {column.subColumns && column.subColumns.map(subColumn => (
          <Droppable key={subColumn.id} droppableId={`${columnIndex}-${subColumn.id}`}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={snapshot.isDraggingOver ? 'subColumnContentActive' : 'subColumnContent'}
              >
                <div className="subColumnTitle">{subColumn.name}</div>
                {subColumn.issues && subColumn.issues.map((issue, index) => (
                  <Draggable key={issue.id} draggableId={`${issue.id}`} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? 'issueDragging' : 'issue'}
                        onClick={() => setActiveIssue({ columnId: columnIndex, issueId: index, subColumnId: subColumn.id })}
                      >
                        {issue.name}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {/* Only show "Add Task" button for "to do" sub-column */}
                {subColumn.name === 'to do' && (
                  <button onClick={() => addIssue(columnIndex, subColumn.id)}>添加任务</button>
                )}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    );
  };

  const deleteColumn = (confirmDelete) => {
    if (confirmDelete) {
      setData(prevData => prevData.filter((_, index) => index !== selectedColumn));
    }
    setSelectedColumn(null);
  };

  const Dustbin = () => (
    <div className="dustbinContainer">
      <div className="columnTitle">垃圾箱</div>
      <Droppable droppableId="99">
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
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="MainBody">
        <div className="header">
          Task Board Total Columns: {data.length}
          <div className="headerTitle">
            from &ensp; {username} &ensp; id: {userId}
            <button className="button addColumnButton" onClick={addColumn}>添加项目</button>
            <button className="button saveDataButton" onClick={saveData}>保存数据</button>
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
          <Dustbin />
        </div>
      </div>
    </DragDropContext>
  );
};

export default TaskBoardContainer;
