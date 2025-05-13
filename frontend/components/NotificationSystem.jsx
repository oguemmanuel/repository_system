"use client"

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notifications", {
        method: "GET",
        credentials: "include", // Include cookies for session management
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/notifications/unread-count", {
        method: "GET",
        credentials: "include", // Include cookies for session management
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.count);
        }
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include", // Include cookies for session management
      });
      
      if (response.ok) {
        // Update the local state
        setNotifications(notifications.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        ));
        // Update the unread count
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/mark-all-read`, {
        method: "PATCH",
        credentials: "include", // Include cookies for session management
      });
      
      if (response.ok) {
        // Update all notifications in the local state
        setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
        // Reset unread count
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete a notification
  const deleteNotification = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include", // Include cookies for session management
      });
      
      if (response.ok) {
        // Remove from local state
        setNotifications(notifications.filter(notification => notification.id !== id));
        // Update unread count
        fetchUnreadCount();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".notification-container")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications and count on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notification-container relative">
      <button 
        className="relative p-1 rounded-full hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-white"
        onClick={toggleDropdown}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-md shadow-lg overflow-hidden z-50 text-gray-800 border border-gray-200">
          <div className="p-3 bg-blue-700 text-white flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead} 
                  className="text-xs bg-blue-600 hover:bg-blue-500 py-1 px-2 rounded flex items-center"
                  title="Mark all as read"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-blue-600 p-1 rounded"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li 
                    key={notification.id} 
                    className={`p-3 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {notification.message}
                        </p>
                        {notification.resourceTitle && (
                          <p className="text-sm text-blue-600 truncate">
                            {notification.resourceTitle}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-start space-x-1">
                        {!notification.isRead && (
                          <button 
                            onClick={() => markAsRead(notification.id)} 
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification.id)} 
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}