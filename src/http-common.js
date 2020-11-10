import axios from "axios";

export default axios.create({
  baseURL: "https://pdf-invoice-extractor.herokuapp.com",
  headers: {
    "Content-type": "application/json"
  }
});
