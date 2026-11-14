import { useState } from "react";
import {
  initialTasks,
  initialFeedback,
  volunteer,
  TASK_STATUS,
} from "./volunteerData";
import FindTasks from "./FindTasks";
import MyTasks from "./MyTasks";
import ServiceHours from "./ServiceHours";
import "./Volunteer.css";

export default function VolunteerDashboard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [feedback] = useState(initialFeedback);
  const [activePage, setActivePage] = useState("overview");

  const myTasks = tasks.filter(
    (task) => task.volunteerId === volunteer.id
  );

  const pendingRequests = myTasks.filter(
    (task) => task.status === TASK_STATUS.REQUESTED
  );

  const assignedTasks = myTasks.filter(
    (task) => task.status === TASK_STATUS.ASSIGNED
  );

  const inProgressTasks = myTasks.filter(
    (task) => task.status === TASK_STATUS.IN_PROGRESS
  );

  const awaitingReviewTasks = myTasks.filter(
    (task) => task.status === TASK_STATUS.AWAITING_REVIEW
  );

  const completedTasks = myTasks.filter(
    (task) => task.status === TASK_STATUS.COMPLETED
  );

  const approvedHours = completedTasks.reduce(
    (total, task) => total + (task.approvedHours || 0),
    0
  );

  const upcomingTasks = [...assignedTasks].sort((a, b) =>
    `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`)
  );

  const availableCount = tasks.filter(
    (task) => task.status === TASK_STATUS.AVAILABLE
  ).length;

  function handleClaimTask(taskId) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId && task.status === TASK_STATUS.AVAILABLE
          ? {
              ...task,
              status: TASK_STATUS.REQUESTED,
              volunteerId: volunteer.id,
              requestedAt: new Date().toISOString(),
            }
          : task
      )
    );
  }

  function handleStartTask(taskId) {
    const target = tasks.find(
      (task) =>
        task.id === taskId &&
        task.volunteerId === volunteer.id &&
        task.status === TASK_STATUS.ASSIGNED
    );

    if (!target) {
      throw new Error("Only assigned tasks can be started.");
    }

    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: TASK_STATUS.IN_PROGRESS,
              startedAt: new Date().toISOString(),
            }
          : task
      )
    );
  }

  function handleCompleteTask(taskId, completion) {
    const target = tasks.find(
      (task) =>
        task.id === taskId &&
        task.volunteerId === volunteer.id &&
        task.status === TASK_STATUS.IN_PROGRESS
    );

    if (!target) {
      throw new Error("Only in-progress tasks can be completed.");
    }

    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...completion,
              status: TASK_STATUS.AWAITING_REVIEW,
              completedAt: new Date().toISOString(),
              approvedHours: 0,
            }
          : task
      )
    );
  }

  return (
    <div className="senior-shell volunteer-portal">
      {/* Shared Top Navigation */}
      <nav
        className="settings-tabs vol-top-nav"
        aria-label="Volunteer portal navigation"
      >
        <button
          type="button"
          className={activePage === "overview" ? "active" : ""}
          onClick={() => setActivePage("overview")}
        >
          Overview
        </button>

        <button
          type="button"
          className={activePage === "findTasks" ? "active" : ""}
          onClick={() => setActivePage("findTasks")}
        >
          Find Tasks ({availableCount})
        </button>

        <button
          type="button"
          className={activePage === "myTasks" ? "active" : ""}
          onClick={() => setActivePage("myTasks")}
        >
          My Tasks ({myTasks.length})
        </button>

        <button
          type="button"
          className={activePage === "serviceHours" ? "active" : ""}
          onClick={() => setActivePage("serviceHours")}
        >
          Service Hours & Feedback
        </button>
      </nav>

      {activePage === "overview" && (
        <section className="senior-box volunteer-dashboard">
          <div className="senior-box-heading">
            <div>
              <h2>Welcome, {volunteer.name}!</h2>
              <p>Here is an overview of your volunteer activity.</p>
            </div>

            <span className="sn-status green">
              <i />
              Account: {volunteer.approvalStatus}
            </span>
          </div>

          {volunteer.approvalStatus !== "Approved" && (
            <p className="vol-privacy-note">
              Your account must be approved before you can claim tasks.
            </p>
          )}

          {/* Summary */}
          <div className="vol-dashboard-stats">
            <article className="vol-dashboard-stat">
              <h3>Assigned Tasks</h3>
              <p>{assignedTasks.length}</p>
            </article>

            <article className="vol-dashboard-stat">
              <h3>In Progress</h3>
              <p>{inProgressTasks.length}</p>
            </article>

            <article className="vol-dashboard-stat">
              <h3>Completed Tasks</h3>
              <p>{completedTasks.length}</p>
            </article>

            <article className="vol-dashboard-stat">
              <h3>Approved Hours</h3>
              <p>{approvedHours.toFixed(1)} hr(s)</p>
            </article>
          </div>

          {/* Quick navigation */}
          <nav
            className="vol-dashboard-links"
            aria-label="Volunteer shortcuts"
          >
            <button
              type="button"
              className="sn-button sn-button-primary"
              onClick={() => setActivePage("findTasks")}
            >
              Find Tasks ({availableCount})
            </button>

            <button
              type="button"
              className="sn-button sn-button-light"
              onClick={() => setActivePage("myTasks")}
            >
              My Tasks
            </button>

            <button
              type="button"
              className="sn-button sn-button-light"
              onClick={() => setActivePage("serviceHours")}
            >
              Service Hours & Feedback
            </button>
          </nav>

          {/* Current activity summary */}
          <section className="vol-dashboard-section">
            <h3>Task Updates</h3>

            <ul className="vol-dashboard-updates">
              <li>
                <strong>{pendingRequests.length}</strong> request(s) waiting
                for caregiver approval.
              </li>

              <li>
                <strong>{inProgressTasks.length}</strong> task(s) currently in
                progress.
              </li>

              <li>
                <strong>{awaitingReviewTasks.length}</strong> completion(s)
                awaiting review. Hours are credited after approval.
              </li>
            </ul>
          </section>

          {/* Assigned tasks */}
          <section className="vol-dashboard-section">
            <h3>Upcoming Assignments</h3>

            {upcomingTasks.length === 0 ? (
              <div className="volunteer-empty-state">
                <p>You have no assigned tasks yet.</p>

                <button
                  type="button"
                  className="sn-button sn-button-light"
                  onClick={() => setActivePage("findTasks")}
                >
                  Browse Available Tasks
                </button>
              </div>
            ) : (
              <>
                <div className="sn-request-list">
                  {upcomingTasks.slice(0, 3).map((task) => (
                    <article key={task.id} className="sn-request-card">
                      <div className="sn-request-body">
                        <div className="sn-request-top">
                          <div>
                            <h4>{task.title}</h4>
                            <span className="sn-category">
                              {task.id} · {task.category}
                            </span>
                          </div>

                          <span className="sn-status green">
                            <i />
                            {task.status}
                          </span>
                        </div>

                        <div className="sn-request-meta">
                          <span>
                            <time dateTime={task.date}>{task.date}</time>
                          </span>

                          <span>
                            {task.startTime}–{task.endTime} (Saudi time)
                          </span>

                          <span>{task.area}</span>
                          <span>{task.estimatedHours} estimated hr(s)</span>
                        </div>

                        <p className="sn-request-details">
                          {task.description}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>

                <button
                  type="button"
                  className="sn-button sn-button-light"
                  onClick={() => setActivePage("myTasks")}
                >
                  View All My Tasks
                </button>
              </>
            )}
          </section>
        </section>
      )}

      {activePage === "findTasks" && (
        <FindTasks tasks={tasks} onClaimTask={handleClaimTask} />
      )}

      {activePage === "myTasks" && (
        <MyTasks
          tasks={tasks}
          onStartTask={handleStartTask}
          onCompleteTask={handleCompleteTask}
        />
      )}

      {activePage === "serviceHours" && (
        <ServiceHours tasks={tasks} feedback={feedback} />
      )}
    </div>
  );
}