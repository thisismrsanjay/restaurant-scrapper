const fetch = require('node-fetch');
const cheerio = require('cheerio');
const db = require('./db');

const getRestaurants = async (state,city)=>{
    const url= `https://www.allmenus.com/${state.toLowerCase()}/${city.toLowerCase()}/-/`;
    
    // fetch(url)
    //     .then(response=>response.text())
    //     .then(body=>{
    //         console.log(body);
    //     })
    
    const response = await fetch(url);
    const body  = await response.text();
    const $  = cheerio.load(body);

    const promises = [];

    //now you can use jquery function for scrapping

    const restaurants = [];
    $('.restaurant-list-item').each((i,item)=>{
        
        const $item = $(item);//cheerio object
        const header = $item.find('h4.name')
        const name = header.text();
        const $anchor = $(header).find('a');
        const link = $anchor.attr('href');
        const id = $anchor.attr('data-masterlist-id');
        
        const address =[];
         $item.find('div.address-container .address').each((i,part)=>{
             const $part = $(part);
             address.push($part.text().trim());
         });

        const cousines = $item.find('p.cousine-list').text().trim().split(',');
         
        const grubhub = $item.find('a.grubhub').attr('href');
        const restaurant ={
            id,
            name,
            address:address.join('\n'),
            cousines,
            link,
            city,
            state
        };
        if(grubhub){
            restaurant.grubhub =grubhub;
        }


         getMenu(link)
            .then(item=>{
                console.log(restaurant.id);
                restaurant.menu=item;
                // Add a new document with a generated id.
                const newRestaurantRef = db.collection("restaurants").doc(id);
                promises.push(newRestaurantRef.set(restaurant));
            })
            .catch(err=>{
                console.log("can't set menu on rest")
            })

       
        
    });

    
    await Promise.all(promises);
    console.log('done adding all data to database!!');


};

const getMenu = async (link)=>{
    // //get restaruant from firebase db by id
    // const docRef = db.collection("restaurants").doc(id);
    // const doc = await docRef.get()
    // const restaurant = doc.data();
    // //make request to menu page 
    // console.log(restaurant);
    const url = `https://www.allmenus.com${link}`;
    const response = await fetch(url);
    const body = await response.text();
    const $ = cheerio.load(body);

    const rawJSON = $($('script[ type="application/ld+json"]')[0]).html();
    const data = JSON.parse(rawJSON);

    
    if(data.hasMenu && data.hasMenu.length>0){
        const items= [];
        data.hasMenu.forEach(menu=>{
            if(menu.hasMenuSection && menu.hasMenuSection.length>0){
                menu.hasMenuSection.forEach(section=>{
                    if(section.hasMenuItem && section.hasMenuItem.length>0){
                        section.hasMenuItem.forEach(item=>{
                            item.menu_name=menu.name;
                            item.menu_section_name= section.name;
                            items.push(item);
                        })
                    }
                })
            }
        })
        await Promise.all(items);
        
        return items;
    }else{
        console.log('No menu found!',id,link);
    }
}

getRestaurants('oh','columbus');