# Attachment

Component to display the attachment element.

## Usage

#### Attachment story element with default template

```jsx
<Attachment element={element} />
```

#### Replace default attachment element template with custom template passed using render

```jsx
const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element["file-name"] }} />;

<Attachment element={element} />;
```

<!-- PROPS -->
