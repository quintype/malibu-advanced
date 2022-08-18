# AlsoRead

Component to display the also read element.

## Usage

#### AlsoRead story element with default template

```jsx
<AlsoRead story={story} element={element} template="default" />
```

#### AlsoRead story element with image right align template

```jsx
<AlsoRead story={story} element={element} template="imageRightAlign" />
```

#### AlsoRead story element with text left align template

```jsx
<AlsoRead element={element} template="textLeftAlign" />
```

#### AlsoRead story element with custom title

```jsx
const css = { title: "Headline" };

<AlsoRead story={story} element={element} template="textLeftAlign" css={css} />;
```

#### AlsoRead story element with text color

```jsx
const css = { textcolor: "#333333" };

<AlsoRead story={story} element={element} template="default" css={css} />;
```

#### Replace default also read element template with custom template passed using render

```jsx
const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;

<AlsoRead element={element} render={customTemplate} />;
```

<!-- PROPS -->
