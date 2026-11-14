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
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "NOTIF-01",
      text: "Caregiver approved your assignment for Help with light kitchen chores (TASK-006).",
      targetPage: "myTasks",
      unread: true,
    },
    {
      id: "NOTIF-02",
      text: "New task posted in Al Doha: Pick up weekly groceries (TASK-001).",
      targetPage: "findTasks",
      unread: true,
    },
  ]);

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

  function hasScheduleOverlap(taskList, candidateTask) {
    return taskList.some(
      (other) =>
        other.volunteerId === volunteer.id &&
        [
          TASK_STATUS.REQUESTED,
          TASK_STATUS.ASSIGNED,
          TASK_STATUS.IN_PROGRESS,
        ].includes(other.status) &&
        other.date === candidateTask.date &&
        other.startTime < candidateTask.endTime &&
        candidateTask.startTime < other.endTime
    );
  }

  function handleClaimTask(taskId) {
    if (volunteer.approvalStatus !== "Approved") {
      throw new Error(
        "Your volunteer account must be approved before claiming tasks."
      );
    }

    const target = tasks.find((task) => task.id === taskId);
    if (!target || target.status !== TASK_STATUS.AVAILABLE) {
      throw new Error("This task is no longer available.");
    }

    if (hasScheduleOverlap(tasks, target)) {
      throw new Error(
        "This task overlaps with another task you have requested or accepted."
      );
    }

    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId &&
        task.status === TASK_STATUS.AVAILABLE &&
        !hasScheduleOverlap(previous, task)
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
        task.id === taskId &&
        task.volunteerId === volunteer.id &&
        task.status === TASK_STATUS.ASSIGNED
          ? {
              ...task,
              status: TASK_STATUS.IN_PROGRESS,
              startedAt: new Date().toISOString(),
            }
          : task
      )
    );
  }

  function handleCompleteTask(taskId, completion = {}) {
    const target = tasks.find(
      (task) =>
        task.id === taskId &&
        task.volunteerId === volunteer.id &&
        task.status === TASK_STATUS.IN_PROGRESS
    );

    if (!target) {
      throw new Error("Only in-progress tasks can be completed.");
    }

    const trimmedNotes = (completion.completionNotes || "").trim();
    if (!trimmedNotes) {
      throw new Error("Completion notes are required.");
    }

    const proofFile = completion.proofFile ?? null;
    if (target.proofRequired && !proofFile) {
      throw new Error("A completion photo is required for this task.");
    }

    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId &&
        task.volunteerId === volunteer.id &&
        task.status === TASK_STATUS.IN_PROGRESS
          ? {
              ...task,
              completionNotes: trimmedNotes,
              proofFile,
              status: TASK_STATUS.AWAITING_REVIEW,
              completedAt: new Date().toISOString(),
              approvedHours: 0,
            }
          : task
      )
    );
  }

  function openNotification(notification) {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notification.id ? { ...item, unread: false } : item
      )
    );
    setActivePage(notification.targetPage);
  }

  return (
    <div className="senior-shell volunteer-portal">
      {/* Persistent Safety Notice until Acknowledged (RU9) */}
      {!safetyAcknowledged && (
        <div
          className="vol-safety-banner"
          role="region"
          aria-label="Volunteer safety reminder"
        >
          <p>
            <strong>Safety Reminder:</strong> SilverNest supports non-medical
            errands and companionship only. Never administer medication or
            perform heavy lifting.
          </p>
          <button
            type="button"
            className="sn-button sn-button-primary"
            onClick={() => setSafetyAcknowledged(true)}
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Interactive Notifications Bar (RU9) */}
      {notifications.some((item) => item.unread) && (
        <div className="vol-notif-bar" aria-label="Volunteer notifications">
          {notifications
            .filter((item) => item.unread)
            .map((item) => (
              <button
                key={item.id}
                type="button"
                className="vol-notif-item"
                onClick={() => openNotification(item)}
              >
                <span>🔔 {item.text}</span>
                <strong>Open →</strong>
              </button>
            ))}
        </div>
      )}

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