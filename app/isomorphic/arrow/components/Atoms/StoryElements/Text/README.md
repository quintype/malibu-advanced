# Text Story Element

Displays the text story element of the story

## Usage

#### Default text story element
```jsx
<Text element={element} />
```

#### Text story element with external links opening in new tab
```jsx
const opts = { isExternalLink: true };

<Text element={element} opts={opts} />
```

#### Text story element as promotional message
```jsx
const promotionalMessage = { ...element, metadata: { "promotional-message": true } };
<Text element={promotionalMessage} opts={opts} />
```

#### Replace default text story element template with custom template passed using render
```jsx
const customTemplate = ({element}) => <h3 dangerouslySetInnerHTML={{ __html: element.text }}/>;

<Text element={element} render={customTemplate} />
```

<!-- PROPS -->
