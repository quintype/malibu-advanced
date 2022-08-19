### Aside Collection

Aside collection is a template which is used to represent a collection of stories or an array of stories.

It also accepts stories from a custom collection if a collection slug is passed.

By default it'll render stories from related stories API.

## Usage

## To pass a collection with default collection name

```jsx
<AsideCollection data={collection} config={config} />
```

## To pass stories with customisable heading and horizontal style

```jsx
<AsideCollection data={stories} config={config} horizontal={true} />
```

## To make aside's last child sticky in tablet and desktop

```jsx
<AsideCollection data={stories} config={config} sticky={true} horizontal={false} />
```
