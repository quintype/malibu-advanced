import * as React from "react";
import { shallow, mount } from "enzyme";
import { generateStoryElementData } from "../../../Fixture";
import { QuestionAnswer } from "./index";

const qaElement = generateStoryElementData("q-and-a");
const qElement = generateStoryElementData("question");
const aElement = generateStoryElementData("answer");

describe("Question & Answer Story Element", () => {
  it("Should render default template", () => {
    const wrapper = mount(<QuestionAnswer element={qaElement} template="default" opts={{ type: "q-and-a" }} />);
    expect(wrapper.find({ "data-test-id": "question-answer" }).prop("className")).toMatch(/qa-default/);
  });

  it("Should render template with author image", () => {
    const wrapper = mount(<QuestionAnswer element={qaElement} template="withAuthorImage" opts={{ type: "q-and-a" }} />);
    expect(wrapper.find({ "data-test-id": "question-answer" }).prop("className")).toMatch(/qa-withAuthorImage/);
  });

  it("Should render default template with external link", () => {
    const wrapper = shallow(
      <QuestionAnswer template="default" opts={{ isExternalLink: true, type: "q-and-a" }} element={qaElement} />
    );
    expect(wrapper.html()).toBe(
      '<div data-test-id="question-answer" class="arrow-component arr-custom-style arr--qa-element question-answer-m_qa-default__2fGK3 "><div class="question-answer-m_q-element__1ZA5d" data-test-id="question"><div data-test-id="edgeIcon" class="question-answer-m_edgeIcon__3js6c question-answer-m_dark__O4Mnm">Q</div><div class="question-answer-m_content__16Ng7 question-answer-m_dark__O4Mnm"><p>Is Ready Player One book<a aria-label=\'content\' target=\'_blank\' href="https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one"> better </a>than the movie?</p></div></div><div class="question-answer-m_a-element__BTxfl" data-test-id="answer"><div data-test-id="edgeIcon" class="question-answer-m_edgeIcon__3js6c question-answer-m_dark__O4Mnm">A</div><div class="question-answer-m_content__16Ng7 question-answer-m_dark__O4Mnm"><p><strong>Ready Player One</strong> is the latest example. I read Earnest Cline\'s <strong><a aria-label=\'content\' target=\'_blank\' href="https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one">book</a></strong> a couple months before watching Steven Spielberg\'s <strong>movie</strong>. ... The <strong>book</strong> generally fares <strong>better</strong> with reviewers, averaging 4.6 out of 5 stars on Amazon, while the <strong>movie</strong> scores 73% on Rotten Tomatoes.</p></div></div></div>'
    );
  });

  it("Should render default template without external link", () => {
    const wrapper = shallow(
      <QuestionAnswer template="default" opts={{ isExternalLink: false, type: "q-and-a" }} element={qaElement} />
    );
    expect(wrapper.html()).toBe(
      '<div data-test-id="question-answer" class="arrow-component arr-custom-style arr--qa-element question-answer-m_qa-default__2fGK3 "><div class="question-answer-m_q-element__1ZA5d" data-test-id="question"><div data-test-id="edgeIcon" class="question-answer-m_edgeIcon__3js6c question-answer-m_dark__O4Mnm">Q</div><div class="question-answer-m_content__16Ng7 question-answer-m_dark__O4Mnm"><p>Is Ready Player One book<a href="https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one"> better </a>than the movie?</p></div></div><div class="question-answer-m_a-element__BTxfl" data-test-id="answer"><div data-test-id="edgeIcon" class="question-answer-m_edgeIcon__3js6c question-answer-m_dark__O4Mnm">A</div><div class="question-answer-m_content__16Ng7 question-answer-m_dark__O4Mnm"><p><strong>Ready Player One</strong> is the latest example. I read Earnest Cline\'s <strong><a href="https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one">book</a></strong> a couple months before watching Steven Spielberg\'s <strong>movie</strong>. ... The <strong>book</strong> generally fares <strong>better</strong> with reviewers, averaging 4.6 out of 5 stars on Amazon, while the <strong>movie</strong> scores 73% on Rotten Tomatoes.</p></div></div></div>'
    );
  });

  it("Should render the default template with icon type", () => {
    const wrapper1 = mount(
      <QuestionAnswer template="default" opts={{ type: "q-and-a", defaultIconType: "curve" }} element={qaElement} />
    );
    expect(wrapper1.find({ "data-test-id": "curveIcon" }).length).toEqual(2);
    const wrapper2 = mount(
      <QuestionAnswer template="default" opts={{ type: "q-and-a", defaultIconType: "edge" }} element={qaElement} />
    );
    expect(wrapper2.find({ "data-test-id": "edgeIcon" }).length).toEqual(2);
  });

  it("Should render custom template", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    const wrapper = shallow(<QuestionAnswer element={qaElement} render={customTemplate} />);
    expect(wrapper.html()).toBe(
      '<h3><div><div class="question"><p>Is Ready Player One book<a href="https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one"> better </a>than the movie?</p></div><div class="answer"><p><strong>Ready Player One</strong> is the latest example. I read Earnest Cline\'s <strong><a href="https://www.jbsimmons.com/blog/books-better-than-movies-ready-player-one">book</a></strong> a couple months before watching Steven Spielberg\'s <strong>movie</strong>. ... The <strong>book</strong> generally fares <strong>better</strong> with reviewers, averaging 4.6 out of 5 stars on Amazon, while the <strong>movie</strong> scores 73% on Rotten Tomatoes.</p></div></div></h3>'
    );
  });
});

describe("Question Story Element", () => {
  it("Should render question", () => {
    const wrapper = mount(<QuestionAnswer element={qElement} template="default" opts={{ type: "question" }} />);
    expect(wrapper.find({ "data-test-id": "answer" }).length).toEqual(0);
    expect(wrapper.find({ "data-test-id": "question" }).length).toEqual(1);
  });
});

describe("Answer Story Element", () => {
  it("Should render answer", () => {
    const wrapper = mount(<QuestionAnswer element={aElement} template="default" opts={{ type: "answer" }} />);
    expect(wrapper.find({ "data-test-id": "question" }).length).toEqual(0);
    expect(wrapper.find({ "data-test-id": "answer" }).length).toEqual(1);
  });
});
