# Summary

Displays the Summary element of the story

## Usage

#### Summary story element with default template

```jsx
<Summary element={element} />
```

#### Summary story element with header template

```jsx
<Summary element={element} template="header" />
```

#### Summary story element with border template

```jsx
<Summary element={element} template="border" />
```

#### Summary story element with header background color

```jsx
const css = { headerBgColor: "#ff214b" };

<Summary element={element} template="borderLeft" css={css} />;
```

#### Summary story element without headline.

```jsx
const opts = { hideHeadline: true };

<Summary element={element} template="borderLeft" opts={opts} />;
```

#### Summary story element with custom headline.

```jsx
const opts = { headline: true };
<Summary element={element} template="borderLeft" opts={opts} />;
```

#### Replace default Summary element template with custom template passed using render

```jsx
const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;

<Summary element={element} render={customTemplate} />;
```

<!-- PROPS -->
