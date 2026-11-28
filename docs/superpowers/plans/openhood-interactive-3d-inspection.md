# Make OpenHood’s inspection viewer interactive in 3D

OpenHood currently flips an SVG drawing and places markers at fixed screen coordinates. Replace that on `/inspect` with **one real 3D sedan model**. Front-left and rear-right become camera angles around the same car, and the inspection markers move with the wheels as the customer rotates it. [Current car view](../../../src/components/CarView.tsx#L18)

## Implementation

- **Model.** Use the low-poly sedan from Kenney’s CC0 Car Kit. Bundle its `.glb` with the app for GitHub Pages and label it **Illustrative vehicle model**. The visit can still identify the customer’s car as a 2018 Honda Civic. [Kenney Car Kit](https://kenney.nl/assets/car-kit)
- **Viewer.** Use `@google/model-viewer` on the inspection route. Open at the front-left angle and support drag to rotate, pinch to zoom, and vertical page scrolling on phones. Provide front-left, rear-right, and zoom buttons so gestures are optional. Each preset resets the framing and preserves the selected finding. [Camera controls](https://modelviewer.dev/examples/stagingandcameras/)
- **Inspection markers.** Place native HTML buttons at 3D coordinates on the front-left and rear-right wheels. Hide each marker when it faces away from the camera. Selecting a marker highlights the existing finding card, and both cards stay available below the viewer at every angle. [3D annotations](https://modelviewer.dev/examples/annotations/)
- **Loading and fallback.** Load the viewer and model only on `/inspect`. If WebGL or the model fails, show the existing unavailable message and keep the findings and evidence links usable. Keep the bay-camera illustration and `?model=off` behavior. Update the README to describe the 3D inspection. [Loading examples](https://modelviewer.dev/examples/loading/)

## Verification

Test that both markers select the correct finding and that the list works when 3D is disabled or fails. In a real browser, verify continuous rotation between the presets, markers staying attached to the correct wheels, keyboard controls, and phone scrolling and pinch zoom. Run the production build and check that the bundled model loads from the GitHub Pages subpath.

## Modern Web Guidance

- **`accessibility`** — Use native buttons for hotspots and camera controls, following “Prefer HTML elements and attributes to ARIA.”
