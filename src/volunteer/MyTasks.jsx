import { useState } from "react";
import { volunteer, TASK_STATUS } from "./volunteerData";
import "./Volunteer.css";

export default function MyTasks({
  tasks = [],
  onStartTask,
  onCompleteTask,
}) {
  const [statusFilter, setStatusFilter] = useState("");
  const [completionTaskId, setCompletionTaskId] = useState(null);
  const [notes, setNotes] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const myTasks = tasks.filter(
    (task) =>
      task.volunteerId === volunteer.id &&
      task.status !== TASK_STATUS.AVAILABLE
  );

  const visibleTasks = myTasks.filter(
    (task) => !statusFilter || task.status === statusFilter
  );

  const statuses = Object.values(TASK_STATUS).filter(
    (status) => status !== TASK_STATUS.AVAILABLE
  );

  async function handleStartTask(taskId) {
    setMessage("");
    setError("");

    const task = tasks.find((item) => item.id === taskId);

    if (
      !task ||
      task.volunteerId !== volunteer.id ||
      task.status !== TASK_STATUS.ASSIGNED
    ) {
      setError("Only your assigned tasks can be started.");
      return;
    }

    if (typeof onStartTask !== "function") {
      setError("The start task action is not connected yet.");
      return;
    }

    setBusyTaskId(taskId);

    try {
      await onStartTask(taskId);
      setMessage("Task started successfully.");
    } catch {
      setError("Could not start the task. Please try again.");
    } finally {
      setBusyTaskId(null);
    }
  }

  function openCompletionForm(taskId) {
    setCompletionTaskId(taskId);
    setNotes("");
    setProofFile(null);
    setMessage("");
    setError("");
  }

  async function handleSubmitCompletion(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const task = tasks.find(
      (item) => item.id === completionTaskId
    );

    if (
      !task ||
      task.volunteerId !== volunteer.id ||
      task.status !== TASK_STATUS.IN_PROGRESS
    ) {
      setError("Only your in-progress tasks can be completed.");
      return;
    }

    if (!notes.trim()) {
      setError("Please enter completion notes.");
      return;
    }

    if (task.proofRequired && !proofFile) {
      setError("Please attach a completion photo.");
      return;
    }

    if (proofFile && !proofFile.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (typeof onCompleteTask !== "function") {
      setError("The completion action is not connected yet.");
      return;
    }

    setBusyTaskId(task.id);

    try {
      await onCompleteTask(task.id, {
        completionNotes: notes.trim(),
        proofFile,
      });

      setCompletionTaskId(null);
      setNotes("");
      setProofFile(null);
      setMessage(
        "Completion submitted! Service hours will be added after approval."
      );
    } catch {
      setError("Could not submit completion. Please try again.");
    } finally {
      setBusyTaskId(null);
    }
  }

  return (
    <section className="senior-box volunteer-my-tasks">
      <div className="senior-box-heading">
        <div>
          <h2>My Tasks</h2>
          <p>Track your requests and manage your assigned tasks.</p>
        </div>
      </div>

      <div className="volunteer-filters">
        <label htmlFor="my-tasks-status">Filter by status</label>

        <select
          id="my-tasks-status"
          className="vol-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">All statuses</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <p role="status" className="vol-success-banner">
        {message}
      </p>

      {error && (
        <p role="alert" className="file-error">
          {error}
        </p>
      )}

      <p className="sn-muted" aria-live="polite">
        {visibleTasks.length} task(s)
      </p>

      {visibleTasks.length === 0 ? (
        <div className="volunteer-empty-state">
          <h3>No tasks found</h3>
          <p>Claim a task from Find Tasks or choose another status.</p>
        </div>
      ) : (
        <div className="sn-request-list">
          {visibleTasks.map((task) => (
            <article key={task.id} className="sn-request-card">
              <div className="sn-request-body">
                <div className="sn-request-top">
                  <div>
                    <h3>{task.title}</h3>
                    <span className="sn-category">
                      {task.id} · {task.category}
                    </span>
                  </div>

                  <span className="sn-status">{task.status}</span>
                </div>

                <div className="sn-request-meta">
                  <span>{task.date}</span>
                  <span>
                    {task.startTime}–{task.endTime} (Saudi time)
                  </span>
                  <span>{task.area}</span>
                  <span>{task.estimatedHours} estimated hr(s)</span>
                </div>

                <p className="sn-request-details">
                  {task.description}
                </p>

                {task.status === TASK_STATUS.REQUESTED ? (
                  <p className="sn-muted">
                    Waiting for caregiver approval. The senior’s
                    private details remain hidden.
                  </p>
                ) : (
                  <>
                    <p>
                      <strong>Senior:</strong>{" "}
                      {task.seniorName || "Not provided"}
                    </p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {task.address || "Not provided"}
                    </p>
                  </>
                )}

                <div className="sn-request-actions">
                  {task.status === TASK_STATUS.ASSIGNED && (
                    <button
                      type="button"
                      className="sn-button sn-button-primary"
                      disabled={busyTaskId !== null}
                      onClick={() => handleStartTask(task.id)}
                    >
                      {busyTaskId === task.id
                        ? "Starting..."
                        : "Start Task"}
                    </button>
                  )}

                  {task.status === TASK_STATUS.IN_PROGRESS &&
                    completionTaskId !== task.id && (
                      <button
                        type="button"
                        className="sn-button sn-button-primary"
                        disabled={busyTaskId !== null}
                        onClick={() => openCompletionForm(task.id)}
                      >
                        Complete Task
                      </button>
                    )}
                </div>

                {task.status === TASK_STATUS.IN_PROGRESS &&
                  completionTaskId === task.id && (
                    <form
                      className="volunteer-task-details"
                      onSubmit={handleSubmitCompletion}
                    >
                      <h4>Complete Task</h4>

                      <label htmlFor={`notes-${task.id}`}>
                        Completion notes (required)
                      </label>
                      <textarea
                        id={`notes-${task.id}`}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Describe the assistance you provided."
                        rows={4}
                        required
                        disabled={busyTaskId !== null}
                      />

                      <label htmlFor={`proof-${task.id}`}>
                        Completion photo{" "}
                        {task.proofRequired ? "(required)" : "(optional)"}
                      </label>
                      <input
                        id={`proof-${task.id}`}
                        type="file"
                        accept="image/*"
                        required={task.proofRequired}
                        disabled={busyTaskId !== null}
                        onChange={(event) =>
                          setProofFile(event.target.files?.[0] || null)
                        }
                      />

                      <div className="sn-modal-actions">
                        <button
                          type="button"
                          className="sn-button sn-button-light"
                          disabled={busyTaskId !== null}
                          onClick={() => {
                            setCompletionTaskId(null);
                            setNotes("");
                            setProofFile(null);
                          }}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="sn-button sn-button-primary"
                          disabled={busyTaskId !== null}
                        >
                          {busyTaskId === task.id
                            ? "Submitting..."
                            : "Submit Completion"}
                        </button>
                      </div>
                    </form>
                  )}

                {task.status === TASK_STATUS.AWAITING_REVIEW && (
                  <p className="sn-muted">
                    Completion submitted. Waiting for review.
                  </p>
                )}

                {task.completionNotes && (
                  <p>
                    <strong>Completion notes:</strong>{" "}
                    {task.completionNotes}
                  </p>
                )}

                {task.status === TASK_STATUS.COMPLETED && (
                  <p>
                    <strong>Approved service hours:</strong>{" "}
                    {task.approvedHours}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}