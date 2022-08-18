# Blurb

Displays the blurb story element of the story

## Usage

#### Blurb story element with default template

```jsx
<Blurb element={element} template="default" />
```

#### Blurb story element with border template

```jsx
<Blurb element={element} template="withBorder" />
```

#### Blurb story element with external links opening in new tab

```jsx
const opts = { isExternalLink: true };

<Blurb element={element} template="default" opts={opts} />;
```

#### Blurb story element with border color

```jsx
const css = { borderColor: "#ff214b" };

<Blurb element={element} template="withBorder" css={css} />;
```

#### Replace default blurb element template with custom template passed using render

```jsx
const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;

<Blurb element={element} render={customTemplate} />;
```

<!-- PROPS -->
