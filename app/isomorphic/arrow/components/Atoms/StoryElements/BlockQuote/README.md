# Block Quote

Displays the Block quote story element of the story

## Usage

#### Block quote story element with default template

```jsx
<BlockQuote element={element} template="default" />
```

#### Block quote story element with background template

```jsx
<BlockQuote element={element} template="withBackground" />
```

#### Block quote story element with border template

```jsx
<BlockQuote element={element} template="withBorder" />
```

#### Block quote story element with background color

```jsx
const css = { backgroundShade: "#ff214b" };

<BlockQuote element={element} template="withBackground" css={css} />;
```

#### Block quote story element with blockquote color

```jsx
const css = { blockQuoteColor: "#ff214b" };

<BlockQuote element={element} template="default" css={css} />;
```

#### Replace default block quote element template with custom template passed using render

```jsx
const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;

<BlockQuote element={element} render={customTemplate} />;
```

<!-- PROPS -->
