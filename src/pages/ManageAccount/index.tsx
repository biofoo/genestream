import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { getInitials } from "@/utils/stringUtils";
import {
  getCachedProfilePicture,
  setCachedProfilePicture,
  clearCachedProfilePicture,
} from "@/utils/profilePictureCache";

const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage: React.FC = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [name, setName] = useState("");
  const [picture, setPicture] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.sub) {
      const cachedPicture = getCachedProfilePicture(user.sub);
      if (cachedPicture) {
        setProfilePicture(cachedPicture);
      }
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user?.sub) return;

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setName(response.data.name || "");
      setEmail(response.data.email || "");

      if (response.data.picture) {
        setCachedProfilePicture(user.sub, response.data.picture);
        setProfilePicture(response.data.picture);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setErrorMessage("Failed to fetch user data. Please try again.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [getAccessTokenSilently]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user?.sub) {
      setErrorMessage("User information is not available.");
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("name", name);
      if (picture) {
        formData.append("picture", picture);
      }

      const response = await axios.put(`${API_URL}/user`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setName(response.data.name);
      if (response.data.picture) {
        setCachedProfilePicture(user.sub, response.data.picture);
        setProfilePicture(response.data.picture);
      }
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully");
      await fetchUserData(); // Refresh user data after update
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrorMessage("Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    return () => {
      // Clear the cache when component unmounts
      if (user?.sub) {
        clearCachedProfilePicture(user.sub);
      }
    };
  }, [user]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg">
      {errorMessage && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-lg font-medium text-genestream-secondary mb-2"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-genestream-secondary shadow-sm focus:border-genestream-primary focus:ring focus:ring-genestream-primary focus:ring-opacity-50 text-lg py-2 px-3"
            />
          </div>
          <div>
            <label
              htmlFor="picture"
              className="block text-lg font-medium text-genestream-secondary mb-2"
            >
              Profile Picture
            </label>
            <input
              type="file"
              id="picture"
              onChange={(e) => setPicture(e.target.files?.[0] || null)}
              className="mt-1 block w-full text-genestream-secondary text-lg"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-genestream-background text-genestream-secondary rounded-lg hover:bg-genestream-background/80 transition duration-200 text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-genestream-primary text-white rounded-lg hover:bg-genestream-primary/90 transition duration-200 text-lg"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="text-center mb-8">
            {profilePicture ? (
              <div className="w-40 h-40 mx-auto mb-4 rounded-full border-4 border-genestream-background overflow-hidden">
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-40 h-40 rounded-full mx-auto mb-4 bg-genestream-background flex items-center justify-center text-5xl text-genestream-secondary">
                {getInitials(name)}
              </div>
            )}
            <h1 className="text-2xl p-4 font-bold text-genestream-primary">
              {name}
            </h1>
            <p className="text-lg text-genestream-secondary">{email}</p>
          </div>

          <div className="space-y-4 flex justify-center">
            <button
              onClick={() => setIsEditing(true)}
              className="block w-3xl text-center py-2 px-6 bg-genestream-primary text-white rounded-lg hover:bg-genestream-primary/90 transition duration-200 text-lg"
            >
              Edit Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
