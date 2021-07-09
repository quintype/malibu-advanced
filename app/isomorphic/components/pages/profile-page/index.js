import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { object, func, bool } from "prop-types";
import get from "lodash/get";

import { updateUserProfile, currentUser } from "@quintype/bridgekeeper-js";

import { SvgIconHandler } from "../../atoms/svg-icon-hadler";
import { MEMBER_UPDATED } from "../../store/actions";

import "./profile-page.m.css";

function signImage(fileName, mimeType) {
  const url = `/api/sign?file-name=${fileName}&mime-type=${mimeType}`;
  return fetch(url).then(res => res.json());
}

const uploadS3ToTemp = async (res, formdata) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
    body: formdata,
    redirect: "follow"
  };

  return fetch(`${res.action}`, requestOptions)
    .then(response => {
      return response;
    })
    .catch(err => console.error(err));
};

const EditProfile = ({ setIsEditing, isEditing }) => {
  const [tempImageObj, setTempImageObj] = useState(null);
  const [name, setName] = useState("");
  const dispatch = useDispatch();

  const prepareFormData = (keys, formdata, imageList, res) => {
    return keys.map(key => {
      if (key === "file") {
        return formdata.append(key, imageList[0].name);
      } else {
        return formdata.append(key, res[key]);
      }
    });
  };

  const onProfileChange = event => {
    const imageList = event.target.files;
    signImage(imageList[0].name, imageList[0].type).then(res => {
      // eslint-disable-next-line no-undef
      const formdata = new FormData();
      formdata.append("name", "phani");

      const keys = [
        "key",
        "Content-Type",
        "policy",
        "acl",
        "success_action_status",
        "AWSAccessKeyId",
        "signature",
        "file"
      ];

      prepareFormData(keys, formdata, imageList, res);
      console.log("FormData is --------", formdata);

      uploadS3ToTemp(res, formdata).then(response => {
        if (response.status === 201) {
          updateUserProfile({ "temp-s3-key": res.key })
            .then(resp => {
              if (!resp) {
                return;
              }
              setTempImageObj(resp);
            })
            .catch(err => {
              console.log(err);
            });
        }
      });
    });
  };

  const getCurrentUser = async () => {
    try {
      const currentUserResp = await currentUser();
      dispatch({ type: MEMBER_UPDATED, member: get(currentUserResp, ["user"], null) });
    } catch (err) {
      console.log("error--------", err);
    }
  };

  const onSubmitHandler = e => {
    e.preventDefault();
    updateUserProfile({ name, "avatar-url": tempImageObj })
      .then(getCurrentUser)
      .then(() => setIsEditing(!isEditing))
      .catch(err => console.error(err));
  };

  const handleChange = e => {
    setName(e.target.value);
  };

  return (
    <div styleName="profile-card">
      <form styleName="profile-information" onSubmit={onSubmitHandler}>
        <div styleName="fields">
          <label>Name: </label>
          <input name="Name" type="text" value={name} onChange={handleChange} />
          <input name="File" type="file" onChange={onProfileChange} />
        </div>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

const ProfileCard = ({ member }) => {
  return (
    <div styleName="profile-information">
      <p styleName="fields">
        <strong>Name: </strong>
        {member.name}
      </p>
      <p styleName="fields">
        <strong>Email: </strong>
        {member.email}
      </p>
    </div>
  );
};

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const member = useSelector(state => state.member || null);

  if (!member) {
    return <div styleName="not-logged-in">Please Login</div>;
  }

  return (
    <div styleName="profile-page">
      <div styleName="my-account">My Account</div>
      <div styleName="profile-card">
        <div styleName="avatar">
          {member["avatar-url"] ? (
            <img src={member["avatar-url"]} alt="avatar" height="160px" width="160px" styleName="avatar-image" />
          ) : (
            <SvgIconHandler type="user" styleName="user-icon" />
          )}
        </div>
        {isEditing ? (
          <EditProfile member={member} setIsEditing={setIsEditing} isEditing={isEditing} />
        ) : (
          <div>
            <ProfileCard member={member} />
            <button onClick={() => setIsEditing(!isEditing)}>Edit Profile</button>
          </div>
        )}
      </div>
    </div>
  );
};

EditProfile.propTypes = {
  isEditing: bool,
  setIsEditing: func
};

ProfileCard.propTypes = {
  member: object
};

export { ProfilePage };
