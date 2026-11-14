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

  // Only approved completions count toward service hours.
  const completedTasks = tasks.filter(
    (task) =>
      task.volunteerId === volunteer.id &&
      task.status === TASK_STATUS.COMPLETED
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

  return (
    <section className="senior-box volunteer-service-hours">
      <div className="senior-box-heading">
        <div>
          <h2>Service Hours</h2>
          <p>Track your approved contributions and feedback.</p>
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
                      {(task.approvedHours || 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  className="sn-request-card"
                >
                  <div className="sn-request-body">
                    <h4>{task.title}</h4>

                    <p>
                      <strong>{review.reviewerName}</strong>
                      {" · "}
                      {review.reviewerRole}
                    </p>

                    <p>Rating: {review.rating} / 5</p>

                    <p>
                      {review.comment || "No written comment."}
                    </p>

                    <p className="sn-muted">
                      <time dateTime={review.createdAt}>
                        {new Date(
                          review.createdAt
                        ).toLocaleDateString("en-GB", {
                          timeZone: "Asia/Riyadh",
                        })}
                      </time>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}