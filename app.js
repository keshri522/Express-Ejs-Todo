const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const dotenv = require("dotenv")
dotenv.config();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }))
// using miidleware to seerver static files to servers
app.use(express.static("public"))
// telling the  we are using template engine here..like EJS
app.set('view engine', 'ejs');


// require modules here.. this is resuable modules..
const date = require('./Modules/date')
// importing mongoose here to connet to the database mongodb to store our data .
const mongoose = require("mongoose")
// Connection our backend to mongodb using mongoose.
mongoose.connect(`mongodb+srv://rkeshri522:${process.env.Mongo_Password}@cluster0.pmobmox.mongodb.net/TodoListItmes`, { UseNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log("Successfully connected to MongoDb")).catch((err) => console.log(err));
// creating a Schema or Blueprint of the documents how our documents structured.
const ItemsSchema = new mongoose.Schema({
    name: String
})
// creating a Collection with that Schema..
const TodoItem = mongoose.model("Item", ItemsSchema);
// here I am creating the documents with that schema..
const data1 = new TodoItem({
    name: "Welcome to MyTodo App"
})
const data2 = new TodoItem({
    name: "Click Add button to add Items"
})
const data3 = new TodoItem({
    name: "Check the Items to Delete"
})

// here i want to show data1,data2,data3 by default on Todo ap so I store all the data in a single array 
const defaultItems = [data1, data2, data3];


// ccreating a new schema for dynamic path all the values will come in the collections
const newSchema = new mongoose.Schema({
    name: String,
    items: [ItemsSchema]
})
// creating a  collection for the Customanme path.
const List = mongoose.model("List", newSchema);
// now inserting all the documents inside the collection TodoItems.
const InsertItems = async () => {
    try {
        const Inserted = await TodoItem.insertMany(defaultItems);
        console.log("SuccessFully Inserted all the Items to TodoItem Collection");
    } catch (error) {
        console.log(error)
    }
}
// getting all the from MOngoDb using find querry and then add a condition.

let Time = date.Today()
app.get("/", (req, res) => {
    // here we call the our Today function that we created in the Modules components.

    let days = "Today's_Goal"
    //    Just calling the InsertItems to the home route 
    // here getdata is asyn function just to find all the documents inside the TodoItem collection.it will filter the conditon if length ===0 then only inserted the default documents other wise simple go to home page and again run the function but this time if not will inside the if condition becasue documents.length !==0 so else block will be executed
    const getdatafromDb = async () => {
        const alldata = await TodoItem.find({});

        if (alldata.length === 0) {
            InsertItems()
            // once inserted then redirect to home all the condition will valid again but this time not go to if block simply go to else block
            res.redirect("/")
        }
        else {
            res.render("index", { ListTitle: days, defaultItems: alldata, DateFormat: Time });
        }
    }
    // simply calling the function here 
    getdatafromDb();
})

// sending the data to the server once user click on add button
app.post("/", async (req, res) => {
    // first we store the input value in data variable
    let data = req.body.additem;
    let route = req.body.list;
    console.log(route)

    console.log(route)

    // adding condtion when our route ===day means i am in home page so add the new documents in TodoItem collections
    if (route === "Today's_Goal") {
        // means i am in home page then add new documetns inside the home page ..in TodoItem collections
        const addNewDocumentToDb = await new TodoItem({
            name: data
        })
        addNewDocumentToDb.save();
        res.redirect("/")
    }
    //   here creating a new documents and add to the TodoItem collection in mongodb
    else {
        try {
            // here checking the name that is present in the List collection or not
            const listdata = await List.findOne({ name: route });
            // listdata return an object which contain a name or items of array .

            // Update the document to add a new item to the items array
            listdata.items.push({ name: data });

            await listdata.save()
            //  it will save the current documents inthe List collections
            res.redirect("/" + route);

        } catch (error) {
            console.log(error)
        }
    }

})

// Creating Api for deleting the docuemtns from Mongodb..
app.post("/delete", async (req, res) => {
    // here we access  the what values come from when user clicked on checkbox inside the form in the name attribute..by using bodyParser
    const checkeddata = req.body.checked;
    const direction = req.body.route;


    //    just like finding we add a contion here for deleting based on user is on which route/path ..
    if (direction === "Today's_Goal") {
        // means we are in the home page simply delete  the item by id.
        // creting a function delte which will delete the particular id from the mongodb..
        const Delete = async () => {
            try {
                const ItemDeleted = await TodoItem.deleteOne({ _id: checkeddata });
                console.log("SuccessFully Deleted The Item from DB");
            } catch (error) {
                console.log(error)
            }
        }
        // calling the function this will the delte the checked items from the Database and after redirect to home page there find all the data and look through them show all the data on ui
        Delete();
        res.redirect("/");
    }

    else {
        // finding the path which name ===direction which come from delete method in index.ejs
        const findData = await List.findOne({ name: direction });

        // it return a object of name or items.

        findData.items.forEach((obj, index) => {
            if (obj._id == checkeddata) {
                findData.items.splice(index, 1);
                findData.save();

            }
        })

        res.redirect("/" + direction);
    }

})

app.get("/:customPathname", (req, res) => {
    const _ = require("lodash");
    // importing lodash to change the path name to when user enter a custompath either in captioal or small letter it will same
    const customPath = _.capitalize(req.params.customPathname);
    // getting all the from List collection and add some condition becasue if user will again the same path then it will add again and again
    const getItemsFromList = async () => {
        try {
            // here I get the specific data which matches the custompath name and check if the data is present then onyly insert the Listdocument into List collections
            // const getallDocumentfromList=await List.find({})
            // console.log(getallDocumentfromList[0])
            const oneItems = await List.findOne({ name: customPath });
            // it also return a object with name or items of array
            //    console.log(oneItems)
            //    console.log(oneItems.items);


            // it insert only if oneItems is present then not insert otherwise it will inserted
            if (!oneItems) {
                const ListDocuments = new List({
                    name: customPath,
                    items: defaultItems
                })
                // saving the documents inside the List collections
                ListDocuments.save();
                res.redirect("/" + customPath)
            }
            // other wise we basiclly render this
            else {
                res.render("index", { ListTitle: customPath, defaultItems: oneItems.items, DateFormat: Time })
            }
        } catch (error) {
            console.log(error)
        }
    }
    // creating a documents here for the List collections.
    getItemsFromList();
})


// now Creating a Post Request for the Custompath when user click on the button to add items it will add to custom path route not in the home route let look here.
// app.post("/:customPathname",(req,res)=>{
//     const dataname=req.params.customPathname;
//     const NewItemsInserted=req.body.additem;
//   const newItmemInserted=new List({
//     name:dataname,
//     items:newItmemInserted
//   })
// })

app.get("/about", (req, res) => {
    res.render("about");
})


const port = process.env.Port || 4000
app.listen(port, () => {
    console.log(`Server is running at ${port}`)
})
