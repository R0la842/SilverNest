import { useState } from "react";
import {
  volunteer,
  serviceCategories,
  TASK_STATUS,
} from "./volunteerData";
import "./Volunteer.css";

export default function FindTasks({ tasks = [], onClaimTask }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  function claimTask(taskId) {
    setError("");
    setMessage("");
    const task = tasks.find((item) => item.id === taskId);

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
        [TASK_STATUS.REQUESTED, TASK_STATUS.ASSIGNED, TASK_STATUS.IN_PROGRESS].includes(
          other.status
        ) &&
        other.date === task.date &&
        other.startTime < task.endTime &&
        task.startTime < other.endTime
    );

    if (hasOverlap) {
      setError("This task overlaps with another task you have requested or accepted.");
      return;
    }

    if (onClaimTask) {
      onClaimTask(taskId);
    }
    setSelectedTaskId(null);
    setMessage("Request submitted! Please wait for caregiver approval.");
  }

  return (
    <main className="volunteer-find-tasks">
      <header className="volunteer-page-header">
        <h1>Find Tasks</h1>
        <p>Find a way to support a senior in your neighborhood.</p>
      </header>

      <section className="volunteer-filters" aria-label="Search and filter tasks">
        <label htmlFor="volunteer-search">Search tasks</label>
        <input
          id="volunteer-search"
          type="search"
          placeholder="Search groceries, walks, or an area..."
          maxLength={50}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <label htmlFor="volunteer-category">Category</label>
        <select
          id="volunteer-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">All categories</option>
          {serviceCategories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label htmlFor="volunteer-area">Area</label>
        <select
          id="volunteer-area"
          value={area}
          onChange={(event) => setArea(event.target.value)}
        >
          <option value="">All areas</option>
          {areas.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button type="button" onClick={clearFilters}>
          Clear Filters
        </button>
      </section>

      <p role="status">{message}</p>
      {error && (
        <p role="alert" className="volunteer-error">
          {error}
        </p>
      )}
      <p aria-live="polite">{filteredTasks.length} available task(s)</p>

      {filteredTasks.length === 0 ? (
        <section className="volunteer-empty-state">
          <h2>No tasks found</h2>
          <p>Try another keyword, category, or area.</p>
          <button type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </section>
      ) : (
        <div className="volunteer-task-grid">
          {filteredTasks.map((task) => (
            <article key={task.id} className="volunteer-task-card">
              <p className="volunteer-task-category">{task.category}</p>
              <h2>{task.title}</h2>
              <p>{task.description}</p>
              <p>
                {task.area} · {task.distanceKm} km away (sample distance)
              </p>
              <p>
                <time dateTime={task.date}>{task.date}</time>
              </p>
              <p>
                {task.startTime}–{task.endTime} (Saudi time)
              </p>
              <p>Estimated time: {task.estimatedHours} hour(s)</p>
              <button
                type="button"
                aria-expanded={selectedTaskId === task.id}
                aria-controls={
                  selectedTaskId === task.id ? "volunteer-task-details" : undefined
                }
                onClick={() => {
                  setSelectedTaskId(selectedTaskId === task.id ? null : task.id);
                  setError("");
                  setMessage("");
                }}
              >
                {selectedTaskId === task.id ? "Hide Details" : "View Details"}
              </button>

              {selectedTaskId === task.id && selectedTask && (
                <section
                  id="volunteer-task-details"
                  className="volunteer-task-details"
                  aria-label={`Details for ${task.title}`}
                >
                  <h3>Task Details</h3>
                  <p>Reference: {task.id}</p>
                  <p>{task.notes}</p>
                  <p>
                    Completion photo: {task.proofRequired ? "Required" : "Not required"}
                  </p>
                  <p>
                    The senior's name and exact address are hidden until caregiver approval.
                  </p>
                  <p>SilverNest offers non-medical assistance only.</p>
                  <button type="button" onClick={() => claimTask(task.id)}>
                    Claim Task
                  </button>
                </section>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}