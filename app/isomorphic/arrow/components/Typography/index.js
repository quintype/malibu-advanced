import React from "react";
import "./style.m.css";

export const Typography = () => {
  return (
    <div className="arrow-component">
      <h2>Typscale</h2>
      <hr />
      <span styleName="wrapper">
        <span>title-h1</span>
        <h1>These violent delights have violent ends.</h1>
      </span>
      <span styleName="wrapper">
        <span>title-h2</span>
        <h2>These violent delights have violent ends.</h2>
      </span>
      <span styleName="wrapper">
        <span>title-h3</span>
        <h2>These violent delights have violent ends.</h2>
      </span>
      <span styleName="wrapper">
        <span>title-h4</span>
        <h4>These violent delights have violent ends.</h4>
      </span>
      <span styleName="wrapper">
        <span>paragraph</span>
        <p>These violent delights have violent ends.</p>
      </span>
      <span styleName="wrapper">
        <span>paragraph-alt</span>
        <p className="p-alt">These violent delights have violent ends.</p>
      </span>
      <span styleName="wrapper">
        <span>author name</span>
        <div className="author-name">These violent delights have violent ends.</div>
      </span>
      <span styleName="wrapper">
        <span>section-tag</span>
        <div className="section-tag">These violent delights have violent ends.</div>
      </span>
      <span styleName="wrapper">
        <span>timestamp</span>
        <div className="time">These violent delights have violent ends.</div>
      </span>
    </div>
  );
};
