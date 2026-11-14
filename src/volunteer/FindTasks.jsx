import { useEffect, useState } from "react";
import {
  volunteer,
  serviceCategories,
  TASK_STATUS,
} from "./volunteerData";
import "./Volunteer.css";

export default function FindTasks({ tasks = [], onClaimTask, highlightedTaskId = null }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [taskToClaim, setTaskToClaim] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

useEffect(() => {
  if (!highlightedTaskId) return;

  setSearch("");
  setCategory("");
  setArea("");
  setSelectedTaskId(highlightedTaskId);
}, [highlightedTaskId]);

useEffect(() => {
  if (!taskToClaim) return;

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setTaskToClaim(null);
    }
  }

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [taskToClaim]);


  const areas = [...new Set(tasks.map((task) => task.area))];
  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const keyword = search.trim().toLowerCase();

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = [task.title, task.description, task.category, task.area]
      .join(" ")
      .toLowerCase()
      .includes(keyword);

    return (
      task.status === TASK_STATUS.AVAILABLE &&
      matchesSearch &&
      (!category || task.category === category) &&
      (!area || task.area === area)
    );
  });

  function clearFilters() {
    setSearch("");
    setCategory("");
    setArea("");
  }

  function handleOpenClaimModal(task) {
    setError("");
    setMessage("");

    if (volunteer.approvalStatus !== "Approved") {
      setError("Your volunteer account must be approved before claiming tasks.");
      return;
    }

    if (!task || task.status !== TASK_STATUS.AVAILABLE) {
      setError("This task is no longer available.");
      return;
    }

    const hasOverlap = tasks.some(
      (other) =>
        other.volunteerId === volunteer.id &&
        [
          TASK_STATUS.REQUESTED,
          TASK_STATUS.ASSIGNED,
          TASK_STATUS.IN_PROGRESS,
        ].includes(other.status) &&
        other.date === task.date &&
        other.startTime < task.endTime &&
        task.startTime < other.endTime
    );

    if (hasOverlap) {
      setError(
        "This task overlaps with another task you have requested or accepted."
      );
      return;
    }

    setTaskToClaim(task);
  }

  async function confirmClaim() {
    if (!taskToClaim) return;

    setError("");
    setMessage("");

    try {
      if (typeof onClaimTask !== "function") {
        throw new Error("The claim action is not connected yet.");
      }

      // The parent rechecks approval, availability, and overlap.
      await onClaimTask(taskToClaim.id);

      setTaskToClaim(null);
      setSelectedTaskId(null);
      setMessage(
        "Request submitted! Please wait for caregiver approval."
      );
    } catch (err) {
      setTaskToClaim(null);
      setError(
        err instanceof Error
          ? err.message
          : "Could not claim this task."
      );
    }
  }

  return (
    <section className="senior-box volunteer-find-tasks">
      <div className="senior-box-heading">
        <div>
          <h2>Find Tasks</h2>
          <p>Find a way to support a senior in your neighborhood.</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="volunteer-filters" aria-label="Search and filter tasks">
        <input
          id="volunteer-search"
          type="search"
          className="vol-search-input"
          placeholder="Search groceries, walks, or an area..."
          maxLength={50}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search tasks"
        />

        <select
          id="volunteer-category"
          className="vol-select"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {serviceCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          id="volunteer-area"
          className="vol-select"
          value={area}
          onChange={(event) => setArea(event.target.value)}
          aria-label="Filter by area"
        >
          <option value="">All areas</option>
          {areas.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="sn-button sn-button-light"
          onClick={clearFilters}
        >
          Clear Filters
        </button>
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
      <p className="sn-muted" aria-live="polite">
        {filteredTasks.length} available task(s)
      </p>

      {filteredTasks.length === 0 ? (
        <div className="volunteer-empty-state">
          <h3>No tasks found</h3>
          <p className="sn-empty-note">Try another keyword, category, or area.</p>
          <button
            type="button"
            className="sn-button sn-button-light"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="sn-request-list">
          {filteredTasks.map((task) => (
         <article
  key={task.id}
  className={`sn-request-card ${highlightedTaskId === task.id ? "vol-highlighted-card" : ""}`}>
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
                  <span className="sn-status green">
                    <i />
                    {task.status}
                  </span>
                </div>

                <div className="sn-request-meta">
                  <span>▣ {task.date}</span>
                  <span>
                    ◷ {task.startTime}–{task.endTime}
                  </span>
                  <span>
                    ⌖ {task.area} · {task.distanceKm} km away
                  </span>
                  <span>⏱ {task.estimatedHours} hr(s)</span>
                </div>

                <p className="sn-request-details">{task.description}</p>

                <div className="sn-request-actions">
                  <button
                    type="button"
                    aria-expanded={selectedTaskId === task.id}
                    onClick={() => {
                      setSelectedTaskId(
                        selectedTaskId === task.id ? null : task.id
                      );
                      setError("");
                      setMessage("");
                    }}
                  >
                    {selectedTaskId === task.id ? "Hide Details" : "View Details"}
                  </button>

                  <button
                    type="button"
                    className="vol-claim-inline-btn"
                    onClick={() => handleOpenClaimModal(task)}
                  >
                    Claim Task
                  </button>
                </div>

                {selectedTaskId === task.id && selectedTask && (
                  <section
                    className="volunteer-task-details"
                    aria-label={`Details for ${task.title}`}
                  >
                    <h4>Task Details</h4>
                    <p>
                      <strong>Notes:</strong> {task.notes}
                    </p>
                    <p>
                      <strong>Completion photo:</strong>{" "}
                      {task.proofRequired ? "Required" : "Not required"}
                    </p>
                    <p className="vol-privacy-note">
                      🔒 The senior's name and exact address are hidden until caregiver approval.
                    </p>
                    <p className="sn-muted">
                      SilverNest offers non-medical assistance only.
                    </p>
                  </section>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Claim Confirmation Modal */}
      {taskToClaim && (
        <div
          className="sn-overlay"
          onMouseDown={(e) => e.target === e.currentTarget && setTaskToClaim(null)}
        >
          <section
            className="sn-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="claim-title"
          >
            <button
              type="button"
              className="sn-close"
              onClick={() => setTaskToClaim(null)}
              aria-label="Close confirmation"
            >
              ×
            </button>
            <p className="sn-eyebrow">CONFIRM CLAIM</p>
            <h2 id="claim-title">Claim this task?</h2>
            <p className="sn-muted">
              Request <strong>{taskToClaim.id} - {taskToClaim.title}</strong>. You will be
              assigned once the family caregiver approves.
            </p>

            <div className="vol-claim-summary">
              <p>
                <strong>Task details:</strong> {taskToClaim.description}
              </p>
              <p>
                <strong>Schedule:</strong> {taskToClaim.date},{" "}
                {taskToClaim.startTime}–{taskToClaim.endTime}
              </p>
              <p>
                <strong>Area:</strong> {taskToClaim.area} ·{" "}
                {taskToClaim.distanceKm} km away
              </p>
            </div>

            <div className="sn-modal-actions">
              <button
                type="button"
                className="sn-button sn-button-light"
                onClick={() => setTaskToClaim(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="sn-button sn-button-primary"
                onClick={confirmClaim}
              >
                Confirm Claim
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}