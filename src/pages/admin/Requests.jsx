import { useState } from "react";
import { requests as startingRequests } from "../../adminRecords.js";

export default function AdminRequests() {
  const [requestList, setRequestList] = useState(startingRequests);

  function changeStatus(id, newStatus) {
    setRequestList((currentRequests) =>
      currentRequests.map((request) =>
        request.id === id
          ? { ...request, status: newStatus }
          : request
      )
    );
  }

  return (
    <main className="ad-page">
      <h1>Assistance Requests</h1>
      <p>View requests and update their status.</p>

      <div className="ad-request-list">
        {requestList.map((request) => (
          <article className="ad-card" key={request.id}>
            <h2>{request.type}</h2>
            <p><strong>Request ID:</strong> {request.id}</p>
            <p><strong>Senior:</strong> {request.senior}</p>
            <p><strong>Volunteer:</strong> {request.volunteer ?? "Unassigned"}</p>
            <p><strong>Date and time:</strong> {request.date}, {request.time}</p>
            <p><strong>Address:</strong> {request.address}</p>
            <p><strong>Notes:</strong> {request.notes || "No notes provided."}</p>

            {request.cancelReason && (
              <p><strong>Cancellation reason:</strong> {request.cancelReason}</p>
            )}

            <label htmlFor={`status-${request.id}`}>Status:</label>
            <select
              id={`status-${request.id}`}
              value={request.status}
              onChange={(event) =>
                changeStatus(request.id, event.target.value)
              }
            >
              <option>Pending</option>
              <option>Accepted</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </article>
        ))}
      </div>
    </main>
  );
}