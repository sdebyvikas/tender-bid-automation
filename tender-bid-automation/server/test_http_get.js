import axios from "axios";

async function testGet() {
  try {
    const res = await axios.get("http://localhost:5005/api/company-profile");
    console.log("GET SUCCESS:", res.status, res.data.success);
  } catch(e) {
    console.log("GET ERROR:", e.message);
  }
}

testGet();
