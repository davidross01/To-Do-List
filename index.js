import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  hostt: "localhost",
  database: "permalist",
  password: "",
  port: 5432
})

db.connect();

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM items ORDER By id ASC ");
    items = result.rows;
    console.log("ALL items: ", items);

    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (error) {
    console.log(error)
  }
});

app.post("/add", async (req, res) => {
  const newItem = req.body.newItem;
  try {
    const result = await db.query("INSERT INTO items (title) VALUES ($1) RETURNING *",[newItem]);
    const items = result.rows;
    console.log("NEW item: " , items[items.length - 1]);
    
    res.redirect("/");
  } catch (error) {
    console.log(error)
  }
});

app.post("/edit", async (req, res) => {
  const editItem = req.body.updatedItemTitle;
  const itemId = req.body.updatedItemId;
  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = ($2)", [editItem, itemId]);
    console.log("EDIT item: ", editItem);

    res.redirect("/");
  } catch (error) {
    console.log(error)
  }
});

app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = ($1)",[deleteItemId]);
    console.log("DELETE item: ", deleteItemId);
    
    res.redirect("/");
  } catch (error) {
    console.log(error)
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
