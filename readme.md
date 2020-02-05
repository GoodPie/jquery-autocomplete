# Jquery Input Autocomplete

This project is a personal project designed to provide basic autocomplete functionality from a set of predefined values.
The existing [autocomplete](https://jqueryui.com/autocomplete/) didn't provide the functionality (as far as I could tell) 
that I wanted which mainly includes the ability to autocomplete tags seperated by a comma.

## Usage

See the demo for an example on how to use it

Attach the input autocomplete to the desired input:

```
$("#testInput").inputAutocomplete({
    predictableText: ["HelloWorld", "Harry", "Hell", "Hello", "Hero"]
});
```

## Options

| Option              | Values   | Default        | Description                    |
| ------------------- | -------- | -------------- | ------------------------------ |
| predictableText     | string[] | []             | Text to use for predictions    |