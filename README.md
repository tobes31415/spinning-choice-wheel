# spinning-choice-wheel

This is a vanilla web-component implementation of a spinning choice wheel.  It should be compatible with any web framework, and will not add any new dependencies to your project (except itself obviously)

This is NOT a production ready component.  The goal of this project is just to create a temporary stand-in for the concept of a "3rd party UI component" used on an internal project for training Junior developers.  So It does work, but it is lacking many features that would be expected from a more complete implementation.

Please feel free to fork this code if you'd like, if you find it useful please send me a message.  I do also have several other repo's you may find interesting that are production ready.

Using this with React
```
import "@tobes31415/spinning-choice-wheel-web-component";
import { SpinningChoiceWheelComponent } from "@tobes31415/spinning-choice-wheel-web-component";

function MyApp() {
    const wheelRef = useRef<SpinningChoiceWheelComponent>(null);
    
    useEffect(() => {
        wheelRef.current.onwheelstopped = r => console.log("it stopped", r);
        wheelRef.current.segments = segments
    },[]);
    
    return <spinning-choice-wheel ref={wheelRef}/>
}


///EXAMAPLE SEGMENTS
[
  {
    text: "hello",
    backgroundColor: "blue",
    textColor: "#eee",
    value: "1",
  },
  {
    text: "world",
    backgroundColor: "green",
    textColor: "#eee",
    value: "2",
  },
  {
    text: "Potato!",
    backgroundColor: "red",
    textColor: "#eee",
    value: "3",
  },
],
```
I haven't figured out how to get react to correctly update the properties on the web component by itself yet, hence why the example above I'm capturing the reference and updating it manually.  Ironically enough the types are defined so that it even can validate the signatures, it just utterly refuses to update the property on the dom when trying to bind it using JSX.  All my attempt so far just result in it setting attributes to "[Object object]".  If someone reading this happens to know how to fix this I would love to learn.
