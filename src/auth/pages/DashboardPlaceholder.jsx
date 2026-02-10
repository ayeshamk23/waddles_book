import React, { useEffect, useMemo, useRef, useState } from "react";
import AuthCard from "../components/AuthCard";
import AuthButton from "../components/AuthButton";

const currentUser = {
  id: "u1",
  name: "Ayesha MK",
  email: "aysha@shaffra.com",
  channelName: "Ayesha Channel",
};

const mockUsers = [
  { id: "u2", name: "Sarah Muhammad", username: "sarahm" },
  { id: "u3", name: "Fida", username: "fida" },
  { id: "u4", name: "Ali", username: "ali" },
  { id: "u5", name: "Mariam", username: "mariam" },
];

const initialFriends = [
  { id: "u2", name: "Sarah Muhammad", username: "sarahm", online: true, status: "friend" },
  { id: "u3", name: "Fida", username: "fida", online: false, status: "pending" },
];

const initialNotifications = [
  {
    id: "n1",
    title: "Welcome",
    message: "Logged in successfully",
    unread: true,
    time: Date.now(),
  },
];

const getInitials = (label = "") =>
  label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0].toUpperCase())
    .join("");

const getProfileInitial = (user) => {
  const source = user.channelName || user.name || "U";
  return source.trim()[0]?.toUpperCase() || "U";
};

function StatusCard({ lastUpdate }) {
  return (
    <div className="dashboard-status-card">
      <div className="dashboard-status-row">
        <span className="dashboard-status-label">Server</span>
        <span className="dashboard-status-value online">Online</span>
      </div>
      <div className="dashboard-status-row">
        <span className="dashboard-status-label">Sync</span>
        <span className="dashboard-status-value">Active</span>
      </div>
      <div className="dashboard-status-row">
        <span className="dashboard-status-label">Last update</span>
        <span className="dashboard-status-value">
          {lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function FriendsModal({
  isOpen,
  onClose,
  friends,
  onRemove,
  onInvite,
  inviteUsername,
  setInviteUsername,
  inviteError,
  setInviteError,
}) {
  if (!isOpen) return null;

  const collaboratorsCount = friends.filter((f) => f.status === "friend").length;
  const pending = friends.filter((f) => f.status === "pending");
  const accepted = friends.filter((f) => f.status === "friend");

  return (
    <div className="dashboard-modal-backdrop" onClick={onClose}>
      <div className="dashboard-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dashboard-modal-header">
          <div>
            <h2 className="dashboard-modal-title">Your friends</h2>
            <p className="dashboard-modal-subtitle">Invite your friend</p>
          </div>
          <button className="dashboard-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="dashboard-modal-content">
          <div className="dashboard-invite-row">
            <input
              className={`auth-input ${inviteError ? "error" : ""}`}
              placeholder="Enter your friend’s username"
              value={inviteUsername}
              onChange={(e) => {
                setInviteUsername(e.target.value);
                setInviteError("");
              }}
            />
            <AuthButton onClick={onInvite}>Invite</AuthButton>
          </div>
          {inviteError && <div className="auth-input-help">{inviteError}</div>}

          <h3 className="dashboard-section-title">Pending invites</h3>
          {pending.length === 0 ? (
            <p className="dashboard-muted">No pending invites</p>
          ) : (
            <div className="dashboard-list">
              {pending.map((friend) => (
                <div className="dashboard-list-row" key={friend.id}>
                  <div className="dashboard-avatar-wrap">
                    <div className="dashboard-avatar">{getInitials(friend.name)}</div>
                    <span className="dashboard-avatar-status muted" />
                  </div>
                  <div className="dashboard-list-info">
                    <div className="dashboard-list-name">{friend.name}</div>
                    <div className="dashboard-list-status pending">Pending</div>
                  </div>
                  <div className="dashboard-list-actions">
                    <button className="invite-remove" onClick={() => onRemove(friend)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h3 className="dashboard-section-title">Friends</h3>
          <div className="dashboard-list">
            {accepted.map((friend) => (
              <div className="dashboard-list-row" key={friend.id}>
                <div className="dashboard-avatar-wrap">
                  <div className="dashboard-avatar">{getInitials(friend.name)}</div>
                  <span
                    className={`dashboard-avatar-status ${friend.online ? "online" : "muted"}`}
                  />
                </div>
                <div className="dashboard-list-info">
                  <div className="dashboard-list-name">{friend.name}</div>
                  <div className="dashboard-list-status">Friend</div>
                </div>
                <div className="dashboard-list-actions">
                  <button className="invite-remove" onClick={() => onRemove(friend)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsPopover({ isOpen, notifications, onMarkAllRead }) {
  if (!isOpen) return null;

  return (
    <div className="dashboard-popover">
      <div className="dashboard-popover-header">
        <span>Notifications</span>
        <button className="dashboard-link" onClick={onMarkAllRead}>
          Mark all as read
        </button>
      </div>
      <div className="dashboard-popover-list">
        {notifications.length === 0 ? (
          <div className="dashboard-muted">No notifications</div>
        ) : (
          notifications.map((note) => (
            <div
              key={note.id}
              className={`dashboard-popover-item ${note.unread ? "unread" : ""}`}
            >
              <div className="dashboard-popover-title">
                {note.title}
                {note.unread && <span className="dashboard-dot" />}
              </div>
              <div className="dashboard-popover-message">{note.message}</div>
              <div className="dashboard-popover-time">
                {new Date(note.time).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ProfileMenu({
  isOpen,
  menuRef,
  onProfile,
  onToggle2FA,
  twoFAEnabled,
  onOpenTerms,
  onOpenPrivacy,
}) {
  if (!isOpen) return null;

  return (
    <div className="dashboard-popover profile" ref={menuRef}>
      <div className="profile-menu-header">
        <div className="dashboard-avatar large">{getProfileInitial(currentUser)}</div>
        <div>
          <div className="profile-name">{currentUser.name}</div>
          <div className="profile-email">{currentUser.email}</div>
        </div>
      </div>
      <button className="profile-item" onClick={onProfile}>
        Customize profile
      </button>
      <div className="profile-divider" />
      <div className="profile-item twofa">
        <span className="profile-item-label">Two-factor authentication</span>
        <button
          className={`profile-switch ${twoFAEnabled ? "on" : ""}`}
          onClick={onToggle2FA}
          aria-label="Toggle two-factor authentication"
        >
          <span className="profile-switch-thumb" />
        </button>
      </div>
      <div className="profile-footer-links">
        <span className="profile-footer-text">
          Our{" "}
          <button className="profile-footer-link" onClick={onOpenTerms}>
            Terms
          </button>{" "}
          and{" "}
          <button className="profile-footer-link" onClick={onOpenPrivacy}>
            Privacy Policy
          </button>
        </span>
      </div>
    </div>
  );
}

function FriendRequestToast({ request, onAccept, onDecline }) {
  if (!request) return null;
  return (
    <div className="dashboard-toast">
      <div className="dashboard-toast-message">
        {request.name} requested a friend request
      </div>
      <div className="dashboard-toast-actions">
        <button className="dashboard-link" onClick={onAccept}>
          Accept
        </button>
        <button className="dashboard-link danger" onClick={onDecline}>
          Decline
        </button>
      </div>
    </div>
  );
}

export default function DashboardPlaceholder({ navigate }) {
  const [friends, setFriends] = useState(initialFriends);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [toastRequest, setToastRequest] = useState(null);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const profileWrapperRef = useRef(null);
  const profileMenuRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((note) => note.unread).length,
    [notifications]
  );

  useEffect(() => {
    const timer = setInterval(() => setLastUpdate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return;
    console.log("GET /notifications (fetch list)");
    if (unreadCount > 0) {
      console.log("POST /notifications/mark-read (mark read)");
      setNotifications((prev) => prev.map((note) => ({ ...note, unread: false })));
    }
  }, [notificationsOpen, unreadCount]);

  useEffect(() => {
    if (!profileOpen) return;
    const handleOutside = (event) => {
      if (profileMenuRef.current?.contains(event.target)) return;
      if (profileWrapperRef.current?.contains(event.target)) return;
      setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [profileOpen]);

  useEffect(() => {
    if (!toastRequest) return;
    const timer = setTimeout(() => {
      setToastRequest(null);
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: "Friend request",
          message: `${toastRequest.name} sent a friend request`,
          unread: true,
          time: Date.now(),
        },
        ...prev,
      ]);
    }, 30000);
    return () => clearTimeout(timer);
  }, [toastRequest]);

  const handleInvite = () => {
    const username = inviteUsername.trim();
    if (!username) {
      setInviteError("Friend username is required");
      return;
    }
    const exists = mockUsers.find((user) => user.username === username);
    if (!exists) {
      setInviteError("Username does not exist");
      return;
    }
    console.log("POST /friends/invite { username }", username);
    setFriends((prev) => {
      if (prev.find((friend) => friend.username === username)) {
        return prev;
      }
      return [
        ...prev,
        { id: exists.id, name: exists.name, username, online: false, status: "pending" },
      ];
    });
    setInviteUsername("");
    setInviteError("");
  };

  const handleRemoveFriend = (friend) => {
    if (!window.confirm(`Remove ${friend.name}?`)) return;
    console.log("DELETE /friends/{friendId} (remove friend)", friend.id);
    setFriends((prev) => prev.filter((item) => item.id !== friend.id));
  };

  const handleAcceptRequest = () => {
    if (!toastRequest) return;
    console.log("POST /friends/accept { requestId }", toastRequest.id);
    setFriends((prev) =>
      prev.map((friend) =>
        friend.id === toastRequest.id ? { ...friend, status: "friend" } : friend
      )
    );
    setToastRequest(null);
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: "Friend accepted",
        message: `${toastRequest.name} is now a collaborator`,
        unread: true,
        time: Date.now(),
      },
      ...prev,
    ]);
  };

  const handleDeclineRequest = () => {
    if (!toastRequest) return;
    console.log("POST /friends/decline { requestId }", toastRequest.id);
    setFriends((prev) => prev.filter((friend) => friend.id !== toastRequest.id));
    setToastRequest(null);
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title: "Friend request declined",
        message: `${toastRequest.name} request was declined`,
        unread: true,
        time: Date.now(),
      },
      ...prev,
    ]);
  };

  const handleSimulateRequest = () => {
    const requestUser = mockUsers[3];
    console.log("POST /friends/request (simulate)", requestUser.id);
    setToastRequest({ ...requestUser });
  };

  const handleProfileClick = () => {
    console.log("GET /profile");
    console.log("PUT /profile {displayName, avatar}");
    navigate("create-profile");
  };

  const handleToggle2FA = () => {
    const next = !twoFAEnabled;
    setTwoFAEnabled(next);
    console.log(next ? "POST /2fa/enable" : "POST /2fa/disable");
  };

  const handleOpenTerms = () => {
    console.log("OPEN /terms");
    window.open("/terms", "_blank");
  };

  const handleOpenPrivacy = () => {
    console.log("OPEN /privacy");
    window.open("/privacy", "_blank");
  };

  return (
    <AuthCard title="Dashboard" subtitle="Welcome back">
      <div className="dashboard-topbar">
        <div className="dashboard-logo-wrap">
          <img src="/assets/mainLogo.png" alt="Logo" className="dashboard-logo" />
        </div>
        <div className="dashboard-actions">
          <button
            className="dashboard-icon-button"
            onClick={() => {
              setFriendsOpen(true);
              setNotificationsOpen(false);
              setProfileOpen(false);
            }}
          >
            <span className="icon">👥</span>
          </button>
          <div className="dashboard-icon-wrapper" ref={profileWrapperRef}>
            <button
              className="dashboard-icon-button"
              onClick={() => {
                setNotificationsOpen((prev) => !prev);
                setFriendsOpen(false);
                setProfileOpen(false);
              }}
            >
              <span className="icon">🔔</span>
              {unreadCount > 0 && <span className="dashboard-badge" />}
            </button>
            <NotificationsPopover
              isOpen={notificationsOpen}
              notifications={notifications}
              onMarkAllRead={() => {
                console.log("POST /notifications/mark-read (mark read)");
                setNotifications((prev) => prev.map((note) => ({ ...note, unread: false })));
              }}
            />
          </div>
          <div className="dashboard-icon-wrapper">
            <button
              className="dashboard-icon-button profile"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setFriendsOpen(false);
                setNotificationsOpen(false);
              }}
            >
              {getProfileInitial(currentUser)}
            </button>
            <ProfileMenu
              isOpen={profileOpen}
              menuRef={profileMenuRef}
              onProfile={handleProfileClick}
              onToggle2FA={handleToggle2FA}
              twoFAEnabled={twoFAEnabled}
              onOpenTerms={handleOpenTerms}
              onOpenPrivacy={handleOpenPrivacy}
            />
          </div>
        </div>
      </div>
      <div className="dashboard-header">
        <StatusCard lastUpdate={lastUpdate} />
      </div>

      <div className="dashboard-body">
        <p>You're logged in. Replace this with your real dashboard content.</p>
        <AuthButton variant="secondary" onClick={handleSimulateRequest}>
          Simulate Friend Request
        </AuthButton>
      </div>

      <FriendsModal
        isOpen={friendsOpen}
        onClose={() => setFriendsOpen(false)}
        friends={friends}
        onRemove={handleRemoveFriend}
        onInvite={handleInvite}
        inviteUsername={inviteUsername}
        setInviteUsername={setInviteUsername}
        inviteError={inviteError}
        setInviteError={setInviteError}
      />

      <FriendRequestToast
        request={toastRequest}
        onAccept={handleAcceptRequest}
        onDecline={handleDeclineRequest}
      />
    </AuthCard>
  );
}
