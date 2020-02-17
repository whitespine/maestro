export default class YTSound {
    static get ytRegEx() {
        return /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)(\/watch\?v=)(.+$)/
    }

    static async _onPreCreatePlaylistSound(playlist, playlistId, updateData, options) {
	    const sound = updateData;
        const isYoutube = YTSound.checkForYoutube(sound);
        
        if (isYoutube) {
            let updatedSound = await YTSound.changeYoutubePath(sound);
            mergeObject(updateData, updatedSound);
        }
    }

    static async _onClosePlaylistSoundConfig(app, html) {
        
    }
    
    static async _onPreUpdatePlaylistSound(playlist, playlistId, updateData, options) {
	    const sound = updateData;
        const isYoutube = YTSound.checkForYoutube(sound);
        
        if (isYoutube) {
            let updatedSound = await YTSound.changeYoutubePath(sound);
            mergeObject(updateData, updatedSound);
        }
    }

    static async checkForYoutube(sound) {
        const match = sound.path.match(YTSound.ytRegEx);
        
        if (!match) {
            return;
        }
        console.log("Is Youtube! with url : ", match[5]);
    }

    static async changeYoutubePath(sound) {
        let updatedSound = duplicate(sound);

        const match = sound.path.match(YTSound.ytRegEx);
        const path = sound.path.split("/").pop().split(".").shift();

        //const response = await fetch("https://cors-anywhere.herokuapp.com/http://genyoutube.net/" + match[4]);
        const response = await fetch("https://download-video-youtube1.p.rapidapi.com/mp3/" + match[5],
            {
	            "method": "GET",
	            "headers": {
		        "x-rapidapi-host": "download-video-youtube1.p.rapidapi.com",
		        "x-rapidapi-key": "87e82ee307msh662f59e118c8e37p1a47cdjsncd8af133c46e"
	        }
        });
        /*
        const response = await fetch("http://genyoutube.net/" + match[4], {
            "mode": "no-cors"
        });
        */
        console.log("Got response : ", response);
        //const text = await response.text();
        const json = await response.json();
        //const url = text.match('(https://redirector.googlevideo.com/[^"]+)');
        const url = json.vidInfo[0].dloadUrl;

        if (!url) {
            return;
        }

        if (sound.name === path) {
            const title = json.vidTitle;
            if (title) {
                updatedSound.name = title;
            }
        }
        
        updatedSound.path = url;
        console.log("New URL : ", updatedSound.path);
        //updatedSound.html5 = "true";
        return updatedSound;
    }

    static patchFunction(func, line_number, line, new_line) {
        let funcStr = func.toString()
        let lines = funcStr.split("\n")
        if (lines[line_number].trim() == line.trim()) {
            let fixed = funcStr.replace(line, new_line)
	    func = Function('"use strict";return (function ' + fixed + ')')();
	    console.log("Changed function : \n", funcStr, "\nInto : \n", func.toString())
        } else {
            console.log("Function has wrong content at line ", line_number, " : ", lines[line_number].trim(), " != ", line.trim(), "\n", funcStr)
	}
	return func
    }
}

/*
AudioHelper.prototype.create = YTSound.patchFunction(AudioHelper.prototype.create, 13,
							 "loop: loop,",
							 "loop: loop, html5: true,")
*/

