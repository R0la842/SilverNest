import { useState } from "react";
import { volunteers as startingVolunteers } from "../../adminRecords.js";

export default function AdminVolunteers() {
  const [volunteerList, setVolunteerList] = useState(startingVolunteers);

  function updateVolunteer(id, decision) {
    setVolunteerList((currentList) =>
      currentList.map((volunteer) =>
        volunteer.id === id
          ? {
              ...volunteer,
              verification: decision,
              status: decision === "Verified" ? "Active" : "Inactive",
            }
          : volunteer
      )
    );
  }

  return (
    <main className="ad-page">
      <h1>Volunteers</h1>
      <p>Review volunteer applications and monitor their performance.</p>

      <table className="ad-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Verification</th>
            <th>Tasks</th>
            <th>Rating</th>
            <th>Completion</th>
            <th>Status</th>
            <th>Area</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {volunteerList.map((volunteer) => (
            <tr key={volunteer.id}>
              <td>{volunteer.name}</td>
              <td>{volunteer.verification}</td>
              <td>{volunteer.tasks}</td>
              <td>{volunteer.rating ?? "—"}</td>
              <td>
                {volunteer.completion == null
                  ? "—"
                  : `${volunteer.completion}%`}
              </td>
              <td>{volunteer.status}</td>
              <td>{volunteer.area}</td>
              <td>
                {volunteer.verification === "Pending review" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => updateVolunteer(volunteer.id, "Verified")}
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={() => updateVolunteer(volunteer.id, "Rejected")}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  "No action needed"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
/* major aid used from chatgpt */