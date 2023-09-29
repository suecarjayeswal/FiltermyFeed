from fastapi import FastAPI
from enum import Enum

app = FastAPI()

#Basic Example for returning text
@app.get("/")
async def root():
    return {"message": "Hello World"}

#Example to take input
@app.get("/items/{item_id}")
async def read_item(item_id):
    return {"item_id": item_id}


#EXample that defines data itself suing enum
class ModelName(str, Enum):
    alexnet = "alexnet"
    resnet = "resnet"
    lenet = "lenet"


@app.get("/models/{model_name}")
async def get_model(model_name: ModelName):
    if model_name is ModelName.alexnet:
        return {"model_name": model_name, "message": "Deep Learning FTW!"}

    if model_name.value == "lenet":
        return {"model_name": model_name, "message": "LeCNN all the images"}

    return {"model_name": model_name, "message": "Have some residuals"}
