var config = {
  apiKey: "AIzaSyCX39YHDlucfDmR7fGYQu-eZiNGfnkCihw",
  authDomain: "nnspaceinvaders.firebaseapp.com",
  databaseURL: "https://nnspaceinvaders.firebaseio.com",
  projectId: "nnspaceinvaders",
  storageBucket: "nnspaceinvaders.appspot.com",
  messagingSenderId: "393739510235"
};
firebase.initializeApp(config);

class DB {
    constructor (cb) {
        this.database = null;
        this.lastError = null;

        cb(null);
        /*
        firebase.auth().signInAnonymously().catch(function(error) {
            db.lastError = error;
            console.log(error);
        });

        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                db.database = firebase.database();
                cb(db);
            }
        });
        */
    }

    saveNNSI (NNSI, cb) {
        console.log("Saving AI");
        let duration = new Date().getTime() - NNSI.startAt;
        let db = this;
        this.database.ref('nn').once('value').then(function(snapshot) {
            let nnData = snapshot.val();
            if ((nnData == null) || (nnData.gc <= NNSI.nn.gc))
            {
                let nn_db = new NN(NNSI.nn);
                nn_db.af.f = null;
                nn_db.af.df = null;
                nn_db.td = [];
                nn_db.tc = 0;
                db.database.ref('nn').set({
                    data: nn_db,
                    gc: nn_db.gc
                }, function(error) {
                    if (error) {
                        cb(false);
                        console.log("AI not saved: " + error);
                    } else {
                        cb(true);
                        console.log("AI Saved successfully");
                    }
                });
            } else {
                cb(false);
                console.log("AI cannot be saved: Low level AI train [" + nnData.gc + " > " + NNSI.nn.gc + "]");
            }
        });


    }

    loadNNSI (cb) {
        console.log("Loading AI");
        this.database.ref('nn').once('value').then(function(snapshot) {
            let nnData = snapshot.val();
            if (nnData != null) {
                cb(new NN(nnData.data));
                console.log("AI loaded: " + nnData.data);
            } else {
                console.log("No data to load");
            }
        });
    }

}
