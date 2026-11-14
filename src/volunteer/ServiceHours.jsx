import { useState } from "react";
import {
  volunteer,
  initialFeedback,
  TASK_STATUS,
} from "./volunteerData";
import "./Volunteer.css";

export default function ServiceHours({
  tasks = [],
  feedback = initialFeedback,
}) {
  const [selectedMonth, setSelectedMonth] = useState("");

  const myTasks = tasks.filter(
    (task) => task.volunteerId === volunteer.id
  );

  // Only approved completions count toward service hours.
  const completedTasks = myTasks.filter(
    (task) => task.status === TASK_STATUS.COMPLETED
  );

  const pendingReviewTasks = myTasks.filter(
    (task) => task.status === TASK_STATUS.AWAITING_REVIEW
  );

  const visibleTasks = completedTasks
    .filter(
      (task) =>
        !selectedMonth || task.date.startsWith(selectedMonth)
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalHours = completedTasks.reduce(
    (total, task) => total + (task.approvedHours || 0),
    0
  );

  const visibleHours = visibleTasks.reduce(
    (total, task) => total + (task.approvedHours || 0),
    0
  );

  const goal = volunteer.serviceHoursGoal || 0;
  const progress =
    goal > 0 ? Math.min((totalHours / goal) * 100, 100) : 0;

  const completedTaskIds = new Set(
    completedTasks.map((task) => task.id)
  );

  const myFeedback = feedback
    .filter(
      (review) =>
        review.volunteerId === volunteer.id &&
        completedTaskIds.has(review.taskId)
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const averageRating =
    myFeedback.length > 0
      ? (
          myFeedback.reduce(
            (total, review) => total + review.rating,
            0
          ) / myFeedback.length
        ).toFixed(1)
      : null;

  // Build chronological activity timeline sorted by actual timestamp (RU9)
  const activityEvents = myTasks
    .flatMap((task) => {
      const events = [];
      if (task.requestedAt) {
        events.push({
          id: `${task.id}-req`,
          timestamp: task.requestedAt,
          label: `Requested "${task.title}" (${task.id})`,
        });
      }
      if (task.assignedAt) {
        events.push({
          id: `${task.id}-asg`,
          timestamp: task.assignedAt,
          label: `Approved & assigned to "${task.title}" (${task.id})`,
        });
      }
      if (task.startedAt) {
        events.push({
          id: `${task.id}-str`,
          timestamp: task.startedAt,
          label: `Started task "${task.title}" (${task.id})`,
        });
      }
      if (task.completedAt) {
        events.push({
          id: `${task.id}-cmp`,
          timestamp: task.completedAt,
          label: `Submitted completion for "${task.title}" (${task.id})`,
        });
      }
      if (task.reviewedAt && task.status === TASK_STATUS.COMPLETED) {
        events.push({
          id: `${task.id}-rev`,
          timestamp: task.reviewedAt,
          label: `Completion approved (+${task.approvedHours} hrs) for "${task.title}" (${task.id})`,
        });
      }
      return events;
    })
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    );

  return (
    <section className="senior-box volunteer-service-hours">
      <div className="senior-box-heading">
        <div>
          <h2>Service Hours</h2>
          <p>Track your approved contributions, activity timeline, and feedback.</p>
        </div>
      </div>

      {/* Overall statistics */}
      <div className="vol-hours-stats">
        <article className="vol-hours-stat">
          <h3>Total Approved Hours</h3>
          <p>{totalHours.toFixed(1)} hr(s)</p>
        </article>

        <article className="vol-hours-stat">
          <h3>Completed Tasks</h3>
          <p>{completedTasks.length}</p>
        </article>

        <article className="vol-hours-stat">
          <h3>Average Rating</h3>
          <p>
            {averageRating
              ? `${averageRating} / 5`
              : "No ratings yet"}
          </p>
        </article>
      </div>

      {pendingReviewTasks.length > 0 && (
        <p className="vol-privacy-note" role="status">
          ⏳ {pendingReviewTasks.length} completed task(s) awaiting caregiver review before hours are credited.
        </p>
      )}

      {/* Overall service-hours goal */}
      {goal > 0 && (
        <section className="vol-hours-goal">
          <h3>Your Service Goal</h3>

          <label htmlFor="volunteer-hours-progress">
            {totalHours.toFixed(1)} of {goal} hours approved
          </label>

          <progress
            id="volunteer-hours-progress"
            value={Math.min(totalHours, goal)}
            max={goal}
          >
            {Math.round(progress)}%
          </progress>

          <p className="sn-muted">
            {totalHours >= goal
              ? "You have reached your service-hours goal!"
              : `${(goal - totalHours).toFixed(1)} hours remaining.`}
          </p>
        </section>
      )}

      {/* Approved task history */}
      <section className="vol-hours-history">
        <h3>Approved Task History</h3>

        <div className="volunteer-filters">
          <label htmlFor="service-hours-month">
            Filter by task month
          </label>

          <input
            id="service-hours-month"
            type="month"
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(event.target.value)
            }
          />

          <button
            type="button"
            className="sn-button sn-button-light"
            onClick={() => setSelectedMonth("")}
          >
            Show All
          </button>
        </div>

        <p className="sn-muted" aria-live="polite">
          {visibleTasks.length} task(s) ·{" "}
          {visibleHours.toFixed(1)} approved hour(s)
          {selectedMonth ? ` for ${selectedMonth}` : " overall"}
        </p>

        {visibleTasks.length === 0 ? (
          <div className="volunteer-empty-state">
            <h4>No approved tasks found</h4>
            <p>
              Tasks awaiting review will appear here after
              their completion is approved.
            </p>
          </div>
        ) : (
          <div className="vol-hours-table-wrap">
            <table className="vol-hours-table">
              <caption>Approved service-hour records</caption>

              <thead>
                <tr>
                  <th scope="col">Task</th>
                  <th scope="col">Category</th>
                  <th scope="col">Task Date</th>
                  <th scope="col">Approved Hours</th>
                </tr>
              </thead>

              <tbody>
                {visibleTasks.map((task) => (
                  <tr key={task.id}>
                    <th scope="row">
                      {task.title}
                      <br />
                      <small>{task.id}</small>
                    </th>

                    <td>{task.category}</td>

                    <td>
                      <time dateTime={task.date}>
                        {task.date}
                      </time>
                    </td>

                    <td>
                      <span className="vol-hours-badge">
                        +{(task.approvedHours || 0).toFixed(1)} hrs
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Activity Timeline (RU9) */}
      <section className="vol-timeline-section">
        <h3>Activity Timeline</h3>
        <p className="sn-muted">All times are Saudi time</p>

        {activityEvents.length === 0 ? (
          <p className="sn-empty-note">No volunteer activity recorded yet.</p>
        ) : (
          <div className="sn-request-list">
            {activityEvents.map((event) => (
              <div className="senior-activity-row" key={event.id}>
                <span>{event.label}</span>
                <small className="sn-muted">
                  <time dateTime={event.timestamp}>
                    {new Date(event.timestamp).toLocaleString("en-GB", {
                      timeZone: "Asia/Riyadh",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </small>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Overall feedback — independent of the month filter */}
      <section className="vol-feedback-section">
        <h3>Feedback</h3>

        {myFeedback.length === 0 ? (
          <p className="sn-empty-note">
            No feedback yet. Reviews will appear here after
            completed tasks are rated.
          </p>
        ) : (
          <div className="sn-request-list">
            {myFeedback.map((review) => {
              const task = completedTasks.find(
                (item) => item.id === review.taskId
              );

              return (
                <article
                  key={review.id}
                  className="vol-feedback-card"
                >
                  <div className="vol-feedback-top">
                    <div>
                      <strong>{task?.title || review.taskId}</strong>
                      <small>
                        {review.reviewerName} · {review.reviewerRole}
                      </small>
                    </div>
                    <span
                      className="vol-stars"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)} ({review.rating}.0)
                    </span>
                  </div>

                  <p>“{review.comment || "No written comment."}”</p>

                  <p className="sn-muted">
                    <time dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString("en-GB", {
                        timeZone: "Asia/Riyadh",
                      })}
                    </time>
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}