use serde::Deserialize;
use std::collections::HashMap;
use std::fs;
use std::fs::File;

#[derive(Debug, Deserialize)]
struct CrateRecipe {
    dizin: String,
    sayfalar: Vec<Sayfa>,
}

#[derive(Debug, Deserialize)]
struct Sayfa {
    tr: String,
    en: String,
}

pub fn load(path: &str) -> HashMap<String, &'static [u8]> {
    let mut files = HashMap::new();
    for entry in fs::read_dir(path).unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_file() {
            let filename = path.file_name().unwrap().to_string_lossy().to_string();
            let content: &'static [u8] = Box::leak(fs::read(&path).unwrap().into_boxed_slice());
            files.insert(filename, content);
        }
    }
    let file = File::open("./crate/crate.yaml").unwrap();
    let recipe: CrateRecipe = serde_yaml::from_reader(file).unwrap();

    let mut insert_alias = |alias: &str, key_base: &str, lang: &str, ext: &str| {
        if let Some(&content) = files.get(&format!("{}-{}.html{}", key_base, lang, ext)) {
            files.insert(format!("{}{}", alias, ext), content);
        }
    };

    insert_alias("?en", &recipe.dizin, "en", "");
    insert_alias("?en", &recipe.dizin, "en", ".br");
    insert_alias("?en", &recipe.dizin, "en", ".gz");
    insert_alias("?tr", &recipe.dizin, "tr", "");
    insert_alias("?tr", &recipe.dizin, "tr", ".br");
    insert_alias("?tr", &recipe.dizin, "tr", ".gz");

    for sayfa in &recipe.sayfalar {
        insert_alias(&sayfa.en, &sayfa.tr, "en", "");
        insert_alias(&sayfa.tr, &sayfa.tr, "tr", "");
        insert_alias(&sayfa.en, &sayfa.tr, "en", ".br");
        insert_alias(&sayfa.tr, &sayfa.tr, "tr", ".br");
        insert_alias(&sayfa.en, &sayfa.tr, "en", ".gz");
        insert_alias(&sayfa.tr, &sayfa.tr, "tr", ".gz");
    }

    files
}
