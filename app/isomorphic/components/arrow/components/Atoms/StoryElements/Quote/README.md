# Quote

Displays the Quote story element of the story

## Usage

#### Quote story element with default template

```jsx
<Quote element={element} template="borderNone" />
```

#### Quote story element with border left template

```jsx
<Quote element={element} template="borderLeft" />
```

#### Quote story element with border top template

```jsx
<Quote element={element} template="borderTopSmall" />
```

#### Quote story element with border color

```jsx
const css = { borderColor: "#ff214b" };

<Quote element={element} template="borderLeft" css={css} />;
```

#### Replace default quote element template with custom template passed using render

```jsx
const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;

<Quote element={element} render={customTemplate} />;
```

<!-- PROPS -->
