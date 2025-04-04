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
  { id: 2, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

let userList = [
  {id: 1, name: "David", color: "#a683e3"},
  {id: 2, name: "Jeremy", color: "green"},
]
let currentUser = 1;

app.post("/listselector", (req, res) => { 
  currentUser = req.body.user;
  let addUser = req.body.add;

  if (currentUser) {
    console.log(`CURRENT USER ID: ${currentUser}`);
    res.redirect("/");
   
  } else if (addUser) {
    console.log(`redirecting to SETTINGS: ${addUser}`);
    res.redirect("/settings");
 }
  
}) 

app.get("/", async (req, res) => {
  try {
    
    const result = await db.query(`
      SELECT * FROM items
      JOIN users ON users.id = user_id
      WHERE items.user_id = ($1)
      ORDER BY items.item_id ASC;
    `, [currentUser]);
    items = result.rows;
    
    const result2 = await db.query(`SELECT * FROM users ORDER BY id ASC;`);
    userList = result2.rows

    console.log("CURR items: ", items);


    const currentUserName = userList.find(user => user.id == currentUser)?.name || "User";
    res.render("index.ejs", {
      listTitle: currentUserName,
      listItems: items,
      users: userList,
    });
    
  } catch (error) {
    console.log(error)
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add", async (req, res) => {
  const newItem = req.body.newItem;
  try {
    const result = await db.query("INSERT INTO items (title, user_id) VALUES ($1, $2) RETURNING *", [newItem, currentUser]);

    const items = result.rows;
    
    res.redirect("/");
  } catch (error) {
    console.log(error)
  }
});

app.post("/edit", async (req, res) => {
  const itemId = req.body.updatedItemId;
  const editItem = req.body.updatedItemTitle;
  console.log("EDIT item_id: ", itemId);

  try {
    await db.query("UPDATE items SET title = ($1) WHERE item_id = ($2)", [editItem, itemId]);
    console.log("EDIT item: ", editItem);

    res.redirect("/");
  } catch (error) {
    console.log(error)
  }
});

app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE item_id = ($1)",[deleteItemId]);
    console.log("DELETE item: ", deleteItemId);
    
    res.redirect("/");
  } catch (error) {
    console.log(error)
  }
});

app.get("/settings", async (req, res) => {
  try {

    const results = await db.query(`SELECT * FROM users ORDER BY id ASC;`);
    userList = results.rows

    console.log(userList[0])

    res.render("settings.ejs", {
      users: userList
    });
  } catch (error) {
    console.log(error)

  }  
});

app.post("/settings/edit", async (req, res) => {
  let id = req.body.updatedID;
  let name = req.body.updateName;
  let color = req.body.updateColor;
  console.log("ID:", id);
  console.log("NAME:", name);
  console.log("COLOR:", color);
   try {
    const result = await db.query(`UPDATE users SET name = ($2), color = ($3) WHERE id = ($1);`,[id, name, color]);
   } catch (error) {
      console.log(error);
   }
  res.redirect("/settings");
});

app.post("/settings/add", async (req, res) => {
  let name = req.body.newList
  let color = req.body.newColor
  try {
    await db.query(`INSERT INTO users (name, color) VALUES (($1), ($2));`, [name, color]);
    res.redirect("/settings");
  } catch (error) {
    console.log(error);
  }
});

app.post("/settings/delete", async (req, res) => {
  let deleteID = req.body.deleteList;
  console.log("DELETE: ", deleteID);
  try {
    await db.query("DELETE FROM items WHERE user_id = $1;", [deleteID]);
    await db.query("DELETE FROM users WHERE id = $1;", [deleteID]);
    
    res.redirect("/settings");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error deleting user.");

  }
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
