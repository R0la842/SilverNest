import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../MemberFeatures.css';
import './Volunteer.css';
import {
  initialTasks,
  initialSafetyAlerts,
  initialNotifications,
  volunteerProfile,
} from './volunteerData';
import FindTasks from './FindTasks';
import MyTasks from './MyTasks';
import ServiceHours from './ServiceHours';

function VolunteerDashboard() {
  // Navigation & search state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Shared tasks state across all tabs
  const [tasks, setTasks] = useState(initialTasks);

  // Safety alerts & notifications
  const [safetyAlerts, setSafetyAlerts] = useState(initialSafetyAlerts);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Highlighted task when navigating from a notification
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);

  // Toast feedback banner
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Derived task lists
  const availableTasks = tasks.filter((t) => t.status === 'Available');
  const assignedTasks = tasks.filter((t) => t.status === 'Assigned');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const completedTasks = tasks.filter((t) => t.status === 'Completed');

  const totalApprovedHours = completedTasks
    .filter((t) => t.hoursApproved)
    .reduce((sum, t) => sum + (t.actualHours || t.estimatedHours), 0);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  // Claim an available task (with approval & schedule overlap check)
  const handleClaimTask = (taskId) => {
    if (!volunteerProfile.isApproved) {
      showToast('Your volunteer profile must be approved before claiming tasks.');
      return;
    }

    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const hasConflict = tasks.some(
      (t) =>
        (t.status === 'Assigned' || t.status === 'In Progress') &&
        t.date === targetTask.date &&
        t.time === targetTask.time
    );

    if (hasConflict) {
      showToast(
        `Schedule conflict: You already have a task scheduled on ${targetTask.date} at ${targetTask.time}.`
      );
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'Assigned' } : t))
    );

    const newNotif = {
      id: `notif-${Date.now()}`,
      type: 'assignment',
      taskId: targetTask.id,
      targetTab: 'mytasks',
      message: `You claimed "${targetTask.title}" for ${targetTask.seniorName}.`,
      time: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(`Task "${targetTask.title}" claimed and added to My Tasks!`);
  };

  // Start an assigned task
  const handleStartTask = (taskId) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'In Progress' } : t))
    );
    if (targetTask) {
      showToast(`Started "${targetTask.title}". Status updated to In Progress.`);
    }
  };

  // Complete an in-progress task with notes and photo proof
  const handleCompleteTask = (taskId, completionNote, proofFileName) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'Completed',
              completionNote,
              proofImage: proofFileName,
              actualHours: t.estimatedHours,
              hoursApproved: false,
            }
          : t
      )
    );

    if (targetTask) {
      const newNotif = {
        id: `notif-${Date.now()}`,
        type: 'completion',
        taskId: targetTask.id,
        targetTab: 'hours',
        message: `Task "${targetTask.title}" submitted for completion. Hours pending admin approval.`,
        time: 'Just now',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      showToast(`"${targetTask.title}" marked as completed!`);
    }
  };

  // Acknowledge individual safety alert
  const handleDismissAlert = (alertId) => {
    setSafetyAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a))
    );
  };

  // Navigate to task on notification click
  const handleNotificationClick = (notif) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    setActiveTab(notif.targetTab);
    setHighlightedTaskId(notif.taskId);
    setShowNotifPanel(false);
    setTimeout(() => setHighlightedTaskId(null), 4000);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const activeSafetyAlerts = safetyAlerts.filter((a) => !a.dismissed);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: '⌂' },
    { id: 'find', label: `Find Tasks (${availableTasks.length})`, icon: '⌕' },
    {
      id: 'mytasks',
      label: `My Tasks (${assignedTasks.length + inProgressTasks.length})`,
      icon: '▤',
    },
    { id: 'hours', label: 'Service Hours', icon: '◷' },
    { id: 'notifications', label: 'Notifications', icon: '♧' },
  ];

  const tabTitles = {
    overview: 'Dashboard',
    find: 'Find Tasks',
    mytasks: 'My Tasks',
    hours: 'Service Hours',
    notifications: 'Notifications',
  };

  const handleQuickSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() && activeTab === 'overview') {
      setActiveTab('find');
    }
  };

  return (
    <div className="sn-app">
      <div className="senior-shell volunteer-shell">
        {/* Left Sidebar matching Senior/Caregiver workspace */}
        <aside className="senior-sidebar">
          <Link className="senior-logo" to="/">
            SilverNest
          </Link>
          <p className="senior-workspace">Volunteer workspace</p>

          <nav className="senior-nav" aria-label="Volunteer workspace navigation">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeTab === item.id ? 'selected' : ''}
                onClick={() => setActiveTab(item.id)}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <Link className="senior-logout" to="/">
            ⇥ &nbsp; Log Out
          </Link>
        </aside>

        {/* Main Workspace Area */}
        <div className="senior-work-area">
          <header className="senior-topbar">
            <label className="senior-search">
              <input
                type="text"
                placeholder="Search SilverNest tasks..."
                aria-label="Search SilverNest tasks"
                value={searchQuery}
                onChange={handleQuickSearch}
              />
              <span>⌕</span>
            </label>

            <div className="senior-account">
              <button
                type="button"
                className="senior-bell"
                aria-label="Open notifications"
                onClick={() => setShowNotifPanel(!showNotifPanel)}
              >
                ♧
                {unreadNotifCount > 0 && <i />}
              </button>
              <span className="senior-avatar">
                {volunteerProfile.name.charAt(0).toUpperCase()}
              </span>
              <button
                type="button"
                className="senior-profile"
                onClick={() => setActiveTab('hours')}
              >
                {volunteerProfile.name} ⌄
              </button>
            </div>
          </header>

          {/* Notification Dropdown Panel */}
          {showNotifPanel && (
            <div className="sn-notice-panel">
              <div className="sn-notice-head">
                <strong>Notifications ({unreadNotifCount} unread)</strong>
                <button
                  type="button"
                  onClick={() => setShowNotifPanel(false)}
                  aria-label="Close notifications"
                >
                  ×
                </button>
              </div>
              {notifications.length > 0 ? (
                <>
                  <div className="sn-notice-list">
                    {notifications.slice(0, 5).map((notif) => (
                      <div
                        key={notif.id}
                        className={`sn-notice vol-notice-clickable ${
                          notif.read ? 'read' : 'unread'
                        }`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <span className="sn-notice-icon">✦</span>
                        <div>
                          <p>{notif.message}</p>
                          <small>{notif.time} · Click to view</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="sn-text-button"
                    onClick={handleMarkAllRead}
                  >
                    Mark all as read
                  </button>
                </>
              ) : (
                <p className="sn-empty-note">You’re all caught up.</p>
              )}
            </div>
          )}

          <main className="senior-main">
            {/* Page Title Header */}
            <div className="senior-page-title">
              <div>
                <h1>{tabTitles[activeTab]}</h1>
                <p>
                  Volunteer workspace ·{' '}
                  {volunteerProfile.isApproved
                    ? '✓ Vetted & Approved Volunteer'
                    : 'Pending Admin Approval'}{' '}
                  · {volunteerProfile.neighborhood}
                </p>
              </div>
            </div>

            {toastMessage && (
              <div className="caregiver-toast" role="status">
                {toastMessage}
              </div>
            )}

            {/* DASHBOARD OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                <div className="senior-greeting">
                  <h2>Good morning, {volunteerProfile.name.split(' ')[0]}!</h2>
                  <p>Welcome to your SilverNest volunteer dashboard.</p>
                </div>

                {/* 3 Stat Cards matching Senior/Caregiver layout */}
                <div className="senior-stat-grid">
                  <article>
                    <div>
                      <span className="senior-stat-number">
                        {assignedTasks.length + inProgressTasks.length}
                      </span>
                      <h3>Active Tasks</h3>
                    </div>
                    <p>
                      {assignedTasks.length} assigned · {inProgressTasks.length} in
                      progress
                    </p>
                  </article>

                  <article>
                    <div>
                      <span className="senior-stat-number">
                        {totalApprovedHours}h
                      </span>
                      <h3>Approved Hours</h3>
                    </div>
                    <p>{completedTasks.length} completed tasks</p>
                  </article>

                  <article>
                    <div>
                      <span className="senior-stat-number">
                        {availableTasks.length}
                      </span>
                      <h3>Open Requests</h3>
                    </div>
                    <p>Available in {volunteerProfile.neighborhood}</p>
                  </article>
                </div>

                {/* Quick Action Buttons */}
                <div className="senior-actions">
                  <button type="button" onClick={() => setActiveTab('find')}>
                    Browse Available Tasks
                  </button>
                  <button type="button" onClick={() => setActiveTab('mytasks')}>
                    Open My Tasks
                  </button>
                </div>

                {/* Safety Alerts (RU9) */}
                {activeSafetyAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`senior-alert vol-safety-alert ${alert.severity}`}
                  >
                    <div className="vol-alert-row">
                      <div>
                        <strong>⚠ Safety Alert: {alert.title}</strong>
                        <span>{alert.message}</span>
                      </div>
                      <button
                        type="button"
                        className="sn-button sn-button-light"
                        onClick={() => handleDismissAlert(alert.id)}
                      >
                        Acknowledge
                      </button>
                    </div>
                  </div>
                ))}

                {/* Lower Two-Column Boxes */}
                <div className="senior-lower-grid">
                  <section className="senior-box">
                    <div className="senior-box-heading">
                      <h2>Upcoming & Active Tasks</h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('mytasks')}
                      >
                        View All My Tasks
                      </button>
                    </div>

                    {[...inProgressTasks, ...assignedTasks].length > 0 ? (
                      [...inProgressTasks, ...assignedTasks]
                        .slice(0, 3)
                        .map((task) => (
                          <div className="senior-activity-row" key={task.id}>
                            <div>
                              <strong>{task.title}</strong>
                              <span>
                                {task.seniorName} · {task.date} at {task.time} ·{' '}
                                {task.status}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveTab('mytasks')}
                            >
                              {task.status === 'In Progress' ? 'Complete' : 'Open'}
                            </button>
                          </div>
                        ))
                    ) : (
                      <p className="sn-empty-note">
                        No active tasks right now. Browse available requests to
                        claim one.
                      </p>
                    )}
                  </section>

                  <section className="senior-box">
                    <div className="senior-box-heading">
                      <h2>Recent Notifications</h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('notifications')}
                      >
                        See All
                      </button>
                    </div>

                    {notifications.slice(0, 3).map((notif) => (
                      <div
                        key={notif.id}
                        className="senior-activity-row vol-notif-row"
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div>
                          <strong>{notif.message}</strong>
                          <span>{notif.time}</span>
                        </div>
                        <button type="button">View</button>
                      </div>
                    ))}
                  </section>
                </div>
              </>
            )}

            {/* FIND TASKS TAB */}
            {activeTab === 'find' && (
              <section className="senior-box">
                <FindTasks
                  availableTasks={availableTasks}
                  onClaimTask={handleClaimTask}
                  highlightedTaskId={highlightedTaskId}
                  isApproved={volunteerProfile.isApproved}
                  externalSearch={searchQuery}
                />
              </section>
            )}

            {/* MY TASKS TAB */}
            {activeTab === 'mytasks' && (
              <section className="senior-box">
                <MyTasks
                  assignedTasks={assignedTasks}
                  inProgressTasks={inProgressTasks}
                  completedTasks={completedTasks}
                  onStartTask={handleStartTask}
                  onCompleteTask={handleCompleteTask}
                  highlightedTaskId={highlightedTaskId}
                />
              </section>
            )}

            {/* SERVICE HOURS TAB */}
            {activeTab === 'hours' && (
              <section className="senior-box">
                <ServiceHours
                  completedTasks={completedTasks}
                  volunteerProfile={volunteerProfile}
                />
              </section>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <section className="senior-box">
                <div className="senior-box-heading">
                  <h2>Notifications ({unreadNotifCount} unread)</h2>
                  {unreadNotifCount > 0 && (
                    <button type="button" onClick={handleMarkAllRead}>
                      Mark all as read
                    </button>
                  )}
                </div>

                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`senior-notification-row vol-notif-row ${
                        !notif.read ? 'unread' : ''
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <strong>{notif.message}</strong>
                      <span>{notif.time} · Open task →</span>
                    </div>
                  ))
                ) : (
                  <p className="sn-empty-note">You’re all caught up.</p>
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default VolunteerDashboard;