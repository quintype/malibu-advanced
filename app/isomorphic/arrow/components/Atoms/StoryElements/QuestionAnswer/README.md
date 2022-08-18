# Question & Answer / Question / Answer

Displays the question & answer/ question/ answer story element of the story

## Usage

#### Question & Answer/ Question/ Answer story element with default template

```jsx
const opts = { type: "q-and-a / question / answer" };

<QuestionAnswer element={element} template="default" opts={opts} />;
```

#### Question & Answer/ Question/ Answer story element with author image

```jsx
const opts = { type: "q-and-a / question / answer" };

<QuestionAnswer element={element} template="withAuthorImage" opts={opts} />;
```

#### Question & Answer/ Question/ Answer story element with external links opening in new tab

```jsx
const opts = { isExternalLink: true, type: "q-and-a / question / answer" };

<QuestionAnswer element={element} template="default" opts={opts} />;
```

#### Question & Answer/ Question/ Answer story element with icon type for default template

```jsx
const opts = { defaultIconType: "curve", type: "q-and-a / question / answer" };

<QuestionAnswer element={element} template="default" opts={opts} />;
```

#### Question & Answer/ Question/ Answer story element with icon color

```jsx
const opts = { type: "q-and-a / question / answer" };
const css = {iconColor: "#ffff"}

<QuestionAnswer element={element} template="default" opts={opts} css={css}/>;
```

#### Replace default question & answer/ question/ answer element template with custom template passed using render

```jsx
const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;

<QuestionAnswer element={element} render={customTemplate} />;
```

<!-- PROPS -->
