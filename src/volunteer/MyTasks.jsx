import { useEffect, useState } from "react";
import { volunteer, TASK_STATUS } from "./volunteerData";
import "./Volunteer.css";

export default function MyTasks({
  tasks = [],
  onStartTask,
  onCompleteTask,
}) {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [completionTaskId, setCompletionTaskId] = useState(null);
  const [notes, setNotes] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");

  const myTasks = tasks.filter(
    (task) =>
      task.volunteerId === volunteer.id &&
      task.status !== TASK_STATUS.AVAILABLE
  );

  const tabs = ["Upcoming", "In Progress", "Completed"];
  const activeCompletionTask = tasks.find(
    (item) => item.id === completionTaskId
  );

  // Close modal with Escape key for keyboard accessibility
  useEffect(() => {
    if (!activeCompletionTask) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && busyTaskId === null) {
        setCompletionTaskId(null);
        setNotes("");
        setProofFile(null);
        setModalError("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCompletionTask, busyTaskId]);

  function getTasksForTab(tab) {
    if (tab === "Upcoming") {
      return myTasks.filter(
        (task) =>
          task.status === TASK_STATUS.ASSIGNED ||
          task.status === TASK_STATUS.REQUESTED
      );
    }
    if (tab === "In Progress") {
      return myTasks.filter((task) => task.status === TASK_STATUS.IN_PROGRESS);
    }
    return myTasks.filter(
      (task) =>
        task.status === TASK_STATUS.COMPLETED ||
        task.status === TASK_STATUS.AWAITING_REVIEW
    );
  }

  const visibleTasks = getTasksForTab(activeTab);

  async function handleStartTask(taskId) {
    if (busyTaskId !== null) return;
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
    setModalError("");
  }

  function closeCompletionForm() {
    if (busyTaskId !== null) return;
    setCompletionTaskId(null);
    setNotes("");
    setProofFile(null);
    setModalError("");
  }

  function handleProofChange(event) {
    const file = event.target.files?.[0] || null;

    setModalError("");
    setProofFile(null);

    if (!file) return;

    const acceptedTypes = ["image/jpeg", "image/png"];

    if (!acceptedTypes.includes(file.type)) {
      setModalError("Please select a JPG or PNG image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setProofFile(file);
  }

  async function handleSubmitCompletion(event) {
    event.preventDefault();
    if (busyTaskId !== null) return;

    setMessage("");
    setModalError("");

    const task = activeCompletionTask;

    if (
      !task ||
      task.volunteerId !== volunteer.id ||
      task.status !== TASK_STATUS.IN_PROGRESS
    ) {
      setModalError("Only your in-progress tasks can be completed.");
      return;
    }

    if (!notes.trim()) {
      setModalError("Please enter completion notes.");
      return;
    }

    if (task.proofRequired && !proofFile) {
      setModalError("Please attach a completion photo.");
      return;
    }

    if (
      proofFile &&
      !["image/jpeg", "image/png"].includes(proofFile.type)
    ) {
      setModalError("Please select a JPG or PNG image.");
      return;
    }

    if (proofFile && proofFile.size > 5 * 1024 * 1024) {
      setModalError("Image size must not exceed 5 MB.");
      return;
    }

    if (typeof onCompleteTask !== "function") {
      setModalError("The completion action is not connected yet.");
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
      setModalError("Could not submit completion. Please try again.");
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

      {/* Figma Tabs with Task Counters */}
      <div className="settings-tabs" role="tablist" aria-label="Task status tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => {
              setActiveTab(tab);
              setError("");
              setMessage("");
            }}
          >
            {tab} ({getTasksForTab(tab).length})
          </button>
        ))}
      </div>

      {message && (
        <p role="status" className="vol-success-banner">
          ✓ {message}
        </p>
      )}

      {error && (
        <p role="alert" className="file-error">
          {error}
        </p>
      )}

      {visibleTasks.length === 0 ? (
        <div className="volunteer-empty-state">
          <h3>No tasks in "{activeTab}"</h3>
          <p className="sn-empty-note">
            Claim a task from Find Tasks or switch to another tab.
          </p>
        </div>
      ) : (
        <div className="sn-request-list">
          {visibleTasks.map((task) => (
            <article key={task.id} className="sn-request-card">
              <div className="sn-request-symbol">
                {task.category === "Accompanied walks" ? "♡" : "⌁"}
              </div>
              <div className="sn-request-body">
                <div className="sn-request-top">
                  <div>
                    <h3>{task.title}</h3>
                    <span className="sn-category">
                      {task.id} · {task.category}
                    </span>
                  </div>

                  <span
                    className={`sn-status ${
                      task.status === TASK_STATUS.COMPLETED ||
                      task.status === TASK_STATUS.ASSIGNED
                        ? "green"
                        : "gold"
                    }`}
                  >
                    <i />
                    {task.status}
                  </span>
                </div>

                <div className="sn-request-meta">
                  <span>▣ {task.date}</span>
                  <span>
                    ◷ {task.startTime}–{task.endTime} (Saudi time)
                  </span>
                  <span>⌖ {task.area}</span>
                  <span>⏱ {task.estimatedHours} estimated hr(s)</span>
                </div>

                <p className="sn-request-details">{task.description}</p>

                <div className="vol-address-box">
                  {task.status === TASK_STATUS.REQUESTED ? (
                    <span className="vol-privacy-note">
                      🔒 Waiting for caregiver approval. The senior’s private
                      details remain hidden.
                    </span>
                  ) : (
                    <>
                      <span>
                        <strong>Senior:</strong>{" "}
                        {task.seniorName || "Not provided"}
                      </span>
                      <span>
                        <strong>Address:</strong>{" "}
                        {task.address || "Not provided"}
                      </span>
                    </>
                  )}
                </div>

                <div className="sn-request-actions">
                  {task.status === TASK_STATUS.ASSIGNED && (
                    <button
                      type="button"
                      className="vol-claim-inline-btn"
                      disabled={busyTaskId !== null}
                      onClick={() => handleStartTask(task.id)}
                    >
                      {busyTaskId === task.id ? "Starting..." : "Start Task"}
                    </button>
                  )}

                  {task.status === TASK_STATUS.IN_PROGRESS && (
                    <button
                      type="button"
                      className="vol-claim-inline-btn"
                      disabled={busyTaskId !== null}
                      onClick={() => openCompletionForm(task.id)}
                    >
                      Mark Complete
                    </button>
                  )}
                </div>

                {task.status === TASK_STATUS.AWAITING_REVIEW && (
                  <p className="sn-muted">
                    Completion submitted. Waiting for review.
                  </p>
                )}

                {task.completionNotes && (
                  <p className="vol-saved-notes">
                    <strong>Completion notes:</strong> {task.completionNotes}
                    {task.proofFile &&
                      ` · Proof: ${
                        typeof task.proofFile === "string"
                          ? task.proofFile
                          : task.proofFile.name
                      }`}
                  </p>
                )}

                {task.status === TASK_STATUS.COMPLETED && (
                  <p>
                    <strong>Approved service hours:</strong>{" "}
                    {task.approvedHours} hr(s)
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Completion Notes & Proof Modal */}
      {activeCompletionTask && (
        <div
          className="sn-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && closeCompletionForm()}
        >
          <section
            className="sn-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="complete-task-title"
          >
            <button
              type="button"
              className="sn-close"
              onClick={closeCompletionForm}
              aria-label="Close"
            >
              ×
            </button>
            <p className="sn-eyebrow">COMPLETE TASK · {activeCompletionTask.id}</p>
            <h2 id="complete-task-title">Submit Task Completion</h2>
            <p className="sn-muted">
              Add your completion notes and proof for{" "}
              <strong>{activeCompletionTask.title}</strong>.
            </p>

            <form className="sn-form" onSubmit={handleSubmitCompletion}>
              <label htmlFor={`notes-${activeCompletionTask.id}`}>
                Completion notes *
                <textarea
                  id={`notes-${activeCompletionTask.id}`}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Describe the assistance you provided..."
                  rows={4}
                  maxLength={300}
                  autoFocus
                  required
                  disabled={busyTaskId !== null}
                />
              </label>

              <label htmlFor={`proof-${activeCompletionTask.id}`}>
                Completion photo{" "}
                {activeCompletionTask.proofRequired
                  ? "(required * — JPG or PNG up to 5 MB)"
                  : "(optional — JPG or PNG up to 5 MB)"}
                <input
                  id={`proof-${activeCompletionTask.id}`}
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  required={activeCompletionTask.proofRequired}
                  disabled={busyTaskId !== null}
                  onChange={handleProofChange}
                />
              </label>

              {modalError && (
                <p role="alert" className="file-error">
                  {modalError}
                </p>
              )}

              <div className="sn-modal-actions">
                <button
                  type="button"
                  className="sn-button sn-button-light"
                  disabled={busyTaskId !== null}
                  onClick={closeCompletionForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sn-button sn-button-primary"
                  disabled={busyTaskId !== null}
                >
                  {busyTaskId === activeCompletionTask.id
                    ? "Submitting..."
                    : "Submit Completion"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}