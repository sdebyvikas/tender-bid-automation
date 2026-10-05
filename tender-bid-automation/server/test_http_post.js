import axios from "axios";
import FormData from "form-data";
import fs from "fs";

async function testHttpUpload() {
  console.log("Waiting 3s for server to settle...");
  await new Promise(r => setTimeout(r, 3000));

  const buf = fs.readFileSync("./uploads/vault-1790859400150-811584433-images.jpg");
  const form = new FormData();
  form.append("name", "PAN Card Test");
  form.append("category", "Tax");
  form.append("document", buf, {
    filename: "images.jpg",
    contentType: "image/jpeg",
  });

  const payload = form.getBuffer();
  const headers = form.getHeaders();

  try {
    console.log("Sending POST to http://localhost:5005/api/company-profile/documents...");
    const res = await axios.post("http://localhost:5005/api/company-profile/documents", payload, {
      headers: {
        ...headers,
        "Content-Length": payload.length,
      },
      timeout: 30000,
    });
    console.log("STATUS:", res.status);
    console.log("DATA:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.log("HTTP ERROR:", err.response.status, err.response.data);
    } else {
      console.log("NETWORK/SYSTEM ERROR:", err.code, err.message);
    }
  }
}

testHttpUpload();
