import React, { useRef, useState } from "react";
import {
  Navbar,
  Container,
  Form,
  Button,
  Collapse,
  Card,
  Alert,
  ListGroup,
} from "react-bootstrap";
import Spinner from "./Spinner/Spinner";
import * as nsfwjs from "nsfwjs";

function App() {
  const [openUrl, setOpenUrl] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // text classification
  const [tweetUrl, setTweetUrl] = useState("");
  const [tweetData, setTweetData] = useState([]);

  // image classification
  const [dataUri, setDataUri] = useState();
  const [displayForm, setDisplayForm] = useState(true);
  const [matureContent, setMatureContent] = useState(true);
  const dropped = useRef();

  const onUrlSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const response = await fetch(
      "https://offensive-content-recognition.herokuapp.com/api/scrapeURL",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: tweetUrl,
        }),
      }
    );
    const data = await response.json();
    console.log(data);
    setTweetData(data.values);
    setIsLoading(false);
  };

  const onImageChange = (file) => {
    setDisplayForm(true);
    if (!file) {
      setDataUri("");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      setIsLoading(true);
      setDataUri(event.target.result);
      const img = dropped.current;
      const model = await nsfwjs.load();
      const predictions = await model.classify(img, 1);
      if (
        predictions[0].className === "Neutral" ||
        predictions[0].className === "Drawing"
      )
        setMatureContent(false);
      else setMatureContent(true);
      setDisplayForm(false);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">offensive-content-detection</Navbar.Brand>
        </Container>
      </Navbar>
      <Container className="mt-5 w-50">
        <Card className="shadow">
          <Card.Header className="d-flex justify-content-center">
            <Button
              className="w-25 mx-2 my-2"
              onClick={() => {
                if (openUrl) {
                  setOpenUrl(false);
                } else {
                  setOpenUrl(true);
                  setOpenImage(false);
                }
                setDisplayForm(true);
              }}
              aria-controls="url-collapse"
              aria-expanded={openUrl}
            >
              URL
            </Button>
            <Button
              className="w-25 mx-2 my-2"
              onClick={() => {
                if (openImage) {
                  setOpenImage(false);
                } else {
                  setOpenUrl(false);
                  setOpenImage(true);
                }
                setDisplayForm(true);
                setTweetData([]);
              }}
              aria-controls="image-collapse"
              aria-expanded={openImage}
            >
              Upload Image
            </Button>
          </Card.Header>
          <div>
            <Collapse in={openUrl}>
              <div id="url-collapse">
                <Form onSubmit={onUrlSubmit}>
                  <Form.Group className="m-3">
                    <Form.Label>
                      Enter URL of the Hashtag on Twitter to be Checked
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter URL"
                      value={tweetUrl}
                      onChange={(e) => setTweetUrl(e.target.value)}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="mb-3 mx-3"
                    disabled={tweetUrl.length === 0}
                  >
                    Submit
                  </Button>
                </Form>
              </div>
            </Collapse>
            <Collapse in={openImage}>
              <div id="image-collapse">
                <Form>
                  <Form.Group className="m-3">
                    <Form.Label>Upload the Image file to be checked</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => onImageChange(e.target.files[0])}
                    />
                  </Form.Group>
                </Form>
              </div>
            </Collapse>
          </div>
        </Card>
        <img hidden alt="" src={dataUri} ref={dropped} />
        {isLoading ? <Spinner /> : null}
        {displayForm ? null : matureContent ? (
          <Alert className="m-3" variant="danger">
            The image uploaded contains mature content
          </Alert>
        ) : (
          <Alert className="m-3" variant="success">
            The image uploaded is safe to view
          </Alert>
        )}
        <ListGroup as="ol" numbered>
          {tweetData.length !== 0 ? (
            <Alert variant="success" className="m-3">
              All toxic and offensive tweets have been filtered
            </Alert>
          ) : null}
          {tweetData.map((tweetVal) => {
            if (tweetVal.labels.length === 0) {
              return (
                <ListGroup.Item
                  as="li"
                  className="d-flex justify-content-between align-items-start mb-3 shadow"
                >
                  <br />
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">{tweetVal.user}</div>
                    {tweetVal.tweet}
                  </div>
                </ListGroup.Item>
              );
            }
          })}
        </ListGroup>
      </Container>
    </>
  );
}

export default App;
