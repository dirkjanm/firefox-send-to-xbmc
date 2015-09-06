module.exports = {

    // The playlist id.
    playlist_id: 1,

    // The playlists.
    playlists: [],

    // Add a playlist.
    add_playlist: function() {
        this.playlists.push(0);

        return this.playlists.length - 1;
    },

    // Add an item.
    add_item: function() {
        this.playlists[this.playlist_id]++;
    },

    // Get playlist items.
    get_size() {
        return this.playlists[this.playlist_id];
    },

    resize(size) {
        this.playlists[this.playlist_id] = size;

    }
};
