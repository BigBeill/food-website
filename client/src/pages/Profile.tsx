import { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

import axios from "../api/axios";
import GrowingText from "../components/GrowingText";
import Loading from "../components/Loading";
import UserObject from "../interfaces/UserObject";
import ImageUploader from "../components/ImageUploader";

const database = import.meta.env.VITE_SERVER_LOCATION;

export default function Profile() {
  const titleParent = useRef(null);
  const navigate = useNavigate();
  const { userId } = useOutletContext<{ userId: string }>();
  const { targetId = userId } = useParams();

  const [userObject, setUserObject] = useState<UserObject>({
    _id: "",
    username: "",
    email: "",
    bio: "",
    relationship: undefined,
  });

  const [imageBuffer, setImageBuffer] = useState<File | null>(null);

  const [fetchingUserData, setFetchingUserData] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);

  const [buttonSafety, setButtonSafety] = useState<boolean>(true);

  function resetUserObject() {
    axios({ method: "get", url: `user/getObject/${targetId}/true` }).then(
      (response) => {
        setImageBuffer(null);
        setUserObject(response);
        setFetchingUserData(false);
      }
    );
  }

  useEffect(() => {
    setEditMode(false);
    setImageBuffer(null);
    setFetchingUserData(true);
    if (!targetId) {
      navigate("/login");
    }
    resetUserObject();
  }, [targetId]);

  function exitEditMode(saveChanges: boolean) {
    if (!userObject) {
      return;
    }
    if (saveChanges) {
      const formData = new FormData();
      formData.append("username", userObject.username);
      formData.append("email", userObject.email ?? "");
      formData.append("bio", userObject.bio ?? "");
      if (imageBuffer instanceof File) {
        formData.append("image", imageBuffer);
      }
      axios({ method: "post", url: "user/updateAccount", data: formData }).then(
        () => {
          resetUserObject();
        }
      );
    } else {
      resetUserObject();
    }
    setEditMode(false);
  }

  function sendFriendRequest() {
    if (!userObject) {
      return;
    }
    axios({
      method: "post",
      url: "user/sendFriendRequest",
      data: { targetId: userObject._id },
    }).then((response) => {
      setUserObject((currentUserObject) => ({
        ...currentUserObject,
        relationship: {
          _id: response._id,
          target: userId,
          type: "requestReceived",
        },
      }));
    });
  }

  function processFriendRequest(accept: boolean) {
    if (!userObject?.relationship) {
      return;
    }
    if (accept) {
      axios({
        method: "post",
        url: "user/processFriendRequest",
        data: { requestId: userObject.relationship._id, accept: true },
      }).then((response) => {
        setUserObject((currentUserObject) => ({
          ...currentUserObject,
          relationship: { _id: response._id, target: userId, type: "friend" },
        }));
      });
    } else {
      axios({
        method: "post",
        url: "user/processFriendRequest",
        data: { requestId: userObject.relationship._id, accept: false },
      }).then(() => {
        setUserObject((currentUserObject) => ({
          ...currentUserObject,
          relationship: { _id: "0", target: userId, type: "none" },
        }));
      });
    }
  }

  function removeFriend() {
    if (!userObject?.relationship) {
      return;
    }
    if (buttonSafety) {
      setButtonSafety(false);
      return;
    }
    axios({
      method: "post",
      url: "user/deleteFriend",
      data: { relationshipId: userObject.relationship._id },
    }).then(() => {
      setUserObject((currentUserObject) => ({
        ...currentUserObject,
        relationship: { _id: "0", target: userId, type: "none" },
      }));
    });
  }

  // handle logout function
  function handleLogout() {
    axios({ method: "post", url: "authentication/logout" }).then(() => {
      location.assign("/");
    });
  }

  // don'd load page until data is fetched
  if (fetchingUserData) {
    return <Loading />;
  }

  return (
    <div className="modernProfilePage">
      {/* Profile Header */}
      <section className="profile-header">
        <div className="profile-header-content">
          <div className="profile-image-container">
            {editMode ? (
              <div className="image-uploader-wrapper">
                <ImageUploader
                  {...{
                    imageBuffer,
                    setImageBuffer,
                    oldImageUrl: userObject.image?.url
                      ? `${database}${userObject.image.url}`
                      : undefined,
                    fallbackImageUrl: "/user-image-fallback.png",
                  }}
                />
                <div className="upload-hint">Click to change photo</div>
              </div>
            ) : (
              <div className="profile-image-display">
                <img
                  src={
                    userObject.image?.url
                      ? `${database}${userObject.image.url}`
                      : "/user-image-fallback.png"
                  }
                  alt="profile picture"
                  onError={(
                    error: React.SyntheticEvent<HTMLImageElement, Event>
                  ) => {
                    error.currentTarget.onerror = null;
                    error.currentTarget.src = "/user-image-fallback.png";
                  }}
                />
                {userObject.relationship?.type === "self" && (
                  <div className="image-overlay">
                    <span>📷</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="username-container" ref={titleParent}>
              <GrowingText text={userObject.username} parentDiv={titleParent} />
              <div className="relationship-badge">
                {getRelationshipBadge(userObject.relationship?.type)}
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-icon">👤</span>
                <span className="stat-label">Profile ID</span>
                <span className="stat-value">{userObject._id}</span>
              </div>
              {userObject.email && (
                <div className="stat-item">
                  <span className="stat-icon">📧</span>
                  <span className="stat-label">Email</span>
                  <span className="stat-value">{userObject.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bio Section */}
      <section className="bio-section">
        <div className="bio-card">
          <div className="bio-header">
            <h3>
              About{" "}
              {userObject.relationship?.type === "self"
                ? "Me"
                : userObject.username}
            </h3>
            {userObject.relationship?.type === "self" && !editMode && (
              <button
                className="edit-bio-btn"
                onClick={() => setEditMode(true)}
              >
                ✏️ Edit
              </button>
            )}
          </div>

          <div className="bio-content">
            {editMode ? (
              <div className="bio-edit-form">
                <label htmlFor="bio" className="bio-label">
                  Tell us about yourself
                </label>
                <textarea
                  id="bio"
                  className="bio-textarea"
                  placeholder="Share something interesting about yourself..."
                  value={userObject.bio}
                  onChange={(event) =>
                    setUserObject({ ...userObject, bio: event.target.value })
                  }
                  rows={6}
                />
              </div>
            ) : (
              <div className="bio-display">
                {userObject.bio ? (
                  <p className="bio-text">{userObject.bio}</p>
                ) : (
                  <div className="no-bio">
                    <span className="no-bio-icon">🤷‍♀️</span>
                    <p>No bio available yet</p>
                    {userObject.relationship?.type === "self" && (
                      <button
                        className="add-bio-btn"
                        onClick={() => setEditMode(true)}
                      >
                        Add Bio
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Actions Section */}
      <section className="actions-section">
        <div className="actions-container">{renderActionButtons()}</div>
      </section>
    </div>
  );

  function getRelationshipBadge(relationshipType?: string) {
    switch (relationshipType) {
      case "self":
        return <span className="badge self">👑 You</span>;
      case "friend":
        return <span className="badge friend">👫 Friend</span>;
      case "requestSent":
        return <span className="badge pending">⏳ Request Sent</span>;
      case "requestReceived":
        return <span className="badge pending">📨 Pending Request</span>;
      default:
        return <span className="badge none">👋 Visitor</span>;
    }
  }

  function renderActionButtons() {
    if (!userObject || !userObject.relationship) return null;

    if (editMode) {
      return (
        <div className="edit-actions">
          <button
            className="action-btn primary"
            onClick={() => exitEditMode(true)}
          >
            💾 Save Changes
          </button>
          <button
            className="action-btn secondary"
            onClick={() => exitEditMode(false)}
          >
            ❌ Cancel
          </button>
        </div>
      );
    }

    switch (userObject.relationship.type) {
      case "none":
        return (
          <div className="social-actions">
            <button className="action-btn primary" onClick={sendFriendRequest}>
              👋 Send Friend Request
            </button>
          </div>
        );

      case "friend":
        return (
          <div className="friend-actions">
            {!buttonSafety ? (
              <div className="confirm-remove">
                <button className="action-btn danger" onClick={removeFriend}>
                  ⚠️ Confirm Remove
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() => setButtonSafety(true)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button className="action-btn secondary" onClick={removeFriend}>
                💔 Remove Friend
              </button>
            )}
          </div>
        );

      case "requestReceived":
        return (
          <div className="request-received-actions">
            <button
              className="action-btn secondary"
              onClick={() => processFriendRequest(false)}
            >
              ❌ Cancel Request
            </button>
          </div>
        );

      case "requestSent":
        return (
          <div className="request-sent-actions">
            <button
              className="action-btn primary"
              onClick={() => processFriendRequest(true)}
            >
              ✅ Accept Request
            </button>
            <button
              className="action-btn secondary"
              onClick={() => processFriendRequest(false)}
            >
              ❌ Reject Request
            </button>
          </div>
        );

      case "self":
        return (
          <div className="self-actions">
            <button
              className="action-btn primary"
              onClick={() => setEditMode(true)}
            >
              ⚙️ Edit Profile
            </button>
            <button className="action-btn danger" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        );

      default:
        return null;
    }
  }
}
